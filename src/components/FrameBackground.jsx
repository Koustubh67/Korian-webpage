import { useEffect, useRef, useState } from "react";
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  CanvasTexture,
  ShaderMaterial,
  Mesh,
  PlaneGeometry,
  Vector2,
  LinearFilter,
} from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { FRAME_COUNT, loadFrames } from "../lib/frames";

/* The frame sequence is painted to an offscreen 2D canvas, which is then used
 * as a live texture on a full-screen quad. That keeps the proven cover-fit
 * frame logic intact while letting a shader displace the result. */

const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAG = `
  precision mediump float;
  uniform sampler2D uTex;
  uniform float uTime;
  uniform vec2  uPointer;   // -1..1, smoothed
  uniform float uAmp;       // global wave amount
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Travelling waves — the ambient motion.
    float w1 = sin(uv.y * 9.0  + uTime * 0.85) * 0.0060;
    float w2 = sin(uv.x * 14.0 - uTime * 0.55) * 0.0035;

    // Pointer ripple: strongest near the cursor, falling off with distance.
    vec2  toPointer = uv - (uPointer * 0.5 + 0.5);
    float d = length(toPointer);
    float ripple = sin(d * 26.0 - uTime * 2.4) * exp(-d * 5.5) * 0.030;

    uv.x += (w1 + ripple) * uAmp;
    uv.y += (w2 + ripple * 0.65) * uAmp;

    // Subtle chromatic split on the displaced sample — reads as "glass".
    float shift = (ripple + w1) * 0.35 * uAmp;
    float r = texture2D(uTex, uv + vec2(shift, 0.0)).r;
    vec4  g = texture2D(uTex, uv);
    float b = texture2D(uTex, uv - vec2(shift, 0.0)).b;

    gl_FragColor = vec4(r, g.g, b, g.a);
  }
`;

export default function FrameBackground() {
  const mountRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // --- offscreen frame canvas -------------------------------------
    const frameCanvas = document.createElement("canvas");
    const fctx = frameCanvas.getContext("2d", { alpha: true });
    const state = { frame: 0 };
    let dirty = true;

    const controller = new AbortController();
    const { images } = loadFrames({
      signal: controller.signal,
      onFirst: () => { dirty = true; },
      onProgress: setProgress,
    });

    function paintFrame() {
      const img = images[Math.round(state.frame)];
      if (!img || !img.complete || !img.naturalWidth) return;
      const ratio = Math.max(
        frameCanvas.width / img.naturalWidth,
        frameCanvas.height / img.naturalHeight
      );
      const w = img.naturalWidth * ratio;
      const h = img.naturalHeight * ratio;
      fctx.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
      fctx.drawImage(img, (frameCanvas.width - w) / 2, (frameCanvas.height - h) / 2, w, h);
      dirty = true;
    }

    // --- three.js layer ---------------------------------------------
    const renderer = new WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const texture = new CanvasTexture(frameCanvas);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;

    const uniforms = {
      uTex: { value: texture },
      uTime: { value: 0 },
      uPointer: { value: new Vector2(0, 0) },
      uAmp: { value: 1 },
    };

    scene.add(
      new Mesh(
        new PlaneGeometry(2, 2),
        new ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          uniforms,
          transparent: true,
        })
      )
    );

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Texture resolution is capped: the shader displaces it anyway, so full
      // DPR here costs upload bandwidth for no visible gain.
      const scale = Math.min(1, 1600 / w);
      frameCanvas.width = Math.round(w * scale);
      frameCanvas.height = Math.round(h * scale);
      renderer.setSize(w, h, false);
      paintFrame();
    }
    resize();
    window.addEventListener("resize", resize);

    // --- pointer ------------------------------------------------------
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // --- scroll scrub across the whole document -----------------------
    const tween = gsap.to(state, {
      frame: FRAME_COUNT - 1,
      ease: "none",
      snap: "frame",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.25,
      },
      onUpdate: paintFrame,
    });

    // --- render loop ---------------------------------------------------
    const tick = (time) => {
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      uniforms.uPointer.value.set(pointer.x, pointer.y);
      uniforms.uTime.value = time;
      if (dirty) {
        texture.needsUpdate = true;
        dirty = false;
      }
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    return () => {
      controller.abort();
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      tween.scrollTrigger?.kill();
      tween.kill();
      texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const pct = Math.round(Math.min(progress / 0.1, 1) * 100);

  return (
    <>
      <div className="framebg" ref={mountRef} aria-hidden="true" />
      {pct < 100 && (
        <div className="preloader">
          <span className="label">Loading sequence</span>
          <span className="preloader__pct">{pct}%</span>
          <div className="preloader__bar">
            <div className="preloader__fill" style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
        </div>
      )}
    </>
  );
}

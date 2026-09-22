import { useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { FRAME_COUNT, loadFrames } from "../lib/frames";

/**
 * Scroll-scrubbed canvas frame sequence.
 * Port of the original vanilla implementation: same cover-fit maths, same
 * 600%-of-viewport scrub distance, same pinning — now lifecycle-safe.
 */
export function useFrameSequence(canvasRef, triggerRef) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const trigger = triggerRef.current;
    if (!canvas || !trigger) return;

    const ctx = canvas.getContext("2d");
    const controller = new AbortController();
    const state = { frame: 0 };

    const { images } = loadFrames({
      signal: controller.signal,
      onFirst: () => render(),
      onProgress: setProgress,
    });

    function draw(img) {
      // Cover-fit: scale to fill, then centre the overflow.
      const ratio = Math.max(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight
      );
      const w = img.naturalWidth * ratio;
      const h = img.naturalHeight * ratio;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    }

    function render() {
      const img = images[Math.round(state.frame)];
      if (img && img.complete && img.naturalWidth > 0) draw(img);
    }

    function resize() {
      // Cap DPR at 2 — beyond that we pay a lot of fill-rate for no visible gain.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      render();
    }

    resize();
    window.addEventListener("resize", resize);

    const tween = gsap.to(state, {
      frame: FRAME_COUNT - 1,
      ease: "none",
      snap: "frame",
      scrollTrigger: {
        trigger,
        start: "top top",
        end: "600% top",
        scrub: 0.15,
        pin: true,
        anticipatePin: 1,
      },
      onUpdate: render,
    });

    return () => {
      controller.abort();
      window.removeEventListener("resize", resize);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [canvasRef, triggerRef]);

  return progress;
}

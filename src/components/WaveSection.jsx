import { useShery } from "../hooks/useShery";

/* Tuning values carried over from the original Shery debug-panel export.
 * Two deliberate changes from the export:
 * - zindex: the exported -9996999 paints below .content, where the opaque
 *   block plate hides it entirely. 2 sits above the block, below the nav.
 * - masker: the mask fills the whole fixed canvas, which covers the rest of
 *   the page as you scroll past this section.*/
const SHERY_CONFIG = {
  style: 5,
  gooey: true,
  config: {
    a: { value: 1.58, range: [0, 30] },
    b: { value: -0.84, range: [-1, 1] },
    zindex: { value: 2, range: [-9999999, 9999999] },
    aspect: { value: 1.6 },
    gooey: { value: true },
    infiniteGooey: { value: true },
    growSize: { value: 2.96, range: [1, 15] },
    durationOut: { value: 1, range: [0.1, 5] },
    durationIn: { value: 1, range: [0.1, 5] },
    displaceAmount: { value: 0.5 },
    masker: { value: false },
    maskVal: { value: 1, range: [1, 5] },
    scrollType: { value: 0 },
    geoVertex: { range: [1, 64], value: 1 },
    noEffectGooey: { value: false },
    onMouse: { value: 1 },
    noise_speed: { value: 0.2, range: [0, 10] },
    metaball: { value: 0.2, range: [0, 2] },
    discard_threshold: { value: 0.47, range: [0, 1] },
    antialias_threshold: { value: 0, range: [0, 0.1] },
    noise_height: { value: 0.18, range: [0, 2] },
    noise_scale: { value: 40.35, range: [0, 100] },
  },
};

export default function WaveSection() {
  useShery("#wave", SHERY_CONFIG);

  return (
    <section className="section wave">
      <span className="label">04 — The character</span>

      <div className="wave__copy">
        <h2 className="display">
          Move your <span className="outline">cursor.</span>
        </h2>
        <p>
          A WebGL displacement shader running over a single image. Drag across
          it — the mesh reacts to pointer velocity in real time.
        </p>
      </div>

      {/* Full-bleed block: breaks the section gutter to span the viewport. */}
      <div className="wave__block" id="wave">
        <img src="/portrait-wide.webp" alt="Cyberfriction studio character" />
      </div>
    </section>
  );
}

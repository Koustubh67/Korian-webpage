const TEXT = "DESIGN — MOTION — INTERFACE — WEBGL — CYBERFRICTION* — ";

/** Standalone marquee band. Lives between sections so it never collides with
 *  the hero figure the way an overlaid marquee did. */
export default function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {[0, 1, 2].map((i) => (
          <span key={i}>{TEXT}</span>
        ))}
      </div>
    </div>
  );
}

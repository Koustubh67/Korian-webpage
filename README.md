# Cyberfriction — Design Studio

A scroll-driven studio site built with React, GSAP and WebGL. A 300-frame
render sequence runs as a fixed background for the full length of the page,
displaced live by a custom GLSL wave shader, with a Shery.js effect on the
portrait block and a full dark/light theme.

**Stack:** React 19 · Vite · GSAP ScrollTrigger · Lenis · Shery.js (three.js)

---

## Running it

```bash
npm install
npm run dev        # dev server
npm run build      # production build -> dist/
npm run preview    # serve the production build
```

## Frame sequence

Source PNGs live in `images/` and are **not** served directly. `npm run frames`
converts them to WebP in `public/frames/`:

```bash
npm run frames            # defaults: quality 72, 1920px wide
Q=60 W=1440 npm run frames # smaller/faster
```

This is the main performance lever — it takes the sequence from **70 MB of PNG
to 17.7 MB of WebP (-75%)** with transparency preserved. Frames load
progressively through a concurrency pool, and the preloader releases the page
once the first 10% are in rather than waiting for all 300.

## Architecture notes

| File | Role |
|---|---|
| `src/components/FrameBackground.jsx` | Fixed full-page layer: frame sequence painted offscreen, then displaced by a GLSL wave shader |
| `src/hooks/useLenis.js` | Lenis smooth scroll driven off GSAP's ticker (single rAF loop) |
| `src/hooks/useShery.js` | Lazy-loads Shery; guards against React StrictMode double-init |
| `src/lib/frames.js` | Progressive frame loader with concurrency pool |
| `src/lib/controlkit-stub.js` | No-op stand-in for a broken transitive dependency |

### Four things worth knowing

**Shery.js needs help to bundle.** It ships raw `.glsl` files expecting a
webpack loader, so `vite.config.js` includes a small `glslRaw()` plugin that
turns them into ES modules. It also has to be excluded from Vite's dependency
pre-bundling, which runs before plugins and would otherwise fail in dev.

**`controlkit` is stubbed.** Shery imports it for its debug panel, but the real
package throws during module evaluation when bundled. Since the panel is only
built behind `debug: true`, a no-op proxy stands in — which also drops ~37 kB
gzipped from the bundle.

**Shery overrides the page background.** `Shery.css` sets
`body { background-color: #fff }` and is injected after the app's own styles by
the dynamic import, so the theme rule uses `html body` to outrank it.

**Shery cannot target a canvas.** It builds its texture from
`elem.getAttribute("src")` and branches on `nodeName === "img"`, so it can only
drive static images — not a canvas repainting 300 frames. The background wave is
therefore a hand-written shader (`FrameBackground.jsx`): the sequence is painted
to an offscreen 2D canvas which becomes a `CanvasTexture` on a full-screen quad,
displaced by travelling sine waves plus a pointer ripple, with a chromatic split
on the sample. Note this pulls three.js into the main bundle
(122 kB → 235 kB gzipped) — the cost of a full-page shader.

## Deploying

`netlify.toml` builds with `npm run build`, publishes `dist/`, and sets
immutable caching on `/frames/*`. Only `dist/` is deployed — the source PNGs in
`images/` are never shipped.

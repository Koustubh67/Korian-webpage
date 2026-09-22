import { useEffect } from "react";

/**
 * Shery.js is a global-style library: it grabs DOM nodes by selector and
 * mounts its own WebGL canvas. It exposes no teardown API, so we guard with a
 * module-level flag — React 19 StrictMode mounts effects twice in dev and
 * would otherwise stack two canvases on the same element.
 */
const initialised = new Set();

export function useShery(selector, config, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled || initialised.has(selector)) return;

    const el = document.querySelector(selector);
    if (!el) return;

    let cancelled = false;

    const waitForImages = () => {
      const imgs = [...el.querySelectorAll("img")];
      return Promise.all(
        imgs.map((img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise((res) => {
                img.onload = img.onerror = res;
              })
        )
      );
    };

    (async () => {
      try {
        // Dynamic import keeps three.js + Shery out of the initial bundle.
        const { default: Shery } = await import("sheryjs");
        await waitForImages();
        if (cancelled) return;

        Shery.imageEffect(selector, config);
        initialised.add(selector);
        el.dataset.sheryActive = "true";
      } catch (err) {
        // Effect is decorative: on failure the underlying <img> still renders.
        console.warn("[shery] effect failed, falling back to static image", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selector, config, enabled]);
}

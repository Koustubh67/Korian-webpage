export const FRAME_COUNT = 300;

/** Frames live in public/frames as male0001.webp ... male0300.webp */
export const frameUrl = (i) =>
  `/frames/male${String(i + 1).padStart(4, "0")}.webp`;

/**
 * Loads the sequence progressively: frame 0 first (so something paints
 * immediately), then the remainder through a small concurrency pool so we
 * never open 300 parallel connections.
 */
export function loadFrames({ onFirst, onProgress, signal, pool = 12 }) {
  const images = new Array(FRAME_COUNT);
  let loaded = 0;

  const load = (i) =>
    new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => {
        images[i] = img;
        onProgress?.(++loaded / FRAME_COUNT);
        resolve(img);
      };
      img.src = frameUrl(i);
    });

  const run = async () => {
    await load(0);
    onFirst?.(images[0]);

    let cursor = 1;
    const worker = async () => {
      while (cursor < FRAME_COUNT) {
        if (signal?.aborted) return;
        await load(cursor++);
      }
    };
    await Promise.all(Array.from({ length: pool }, worker));
  };

  return { images, done: run() };
}

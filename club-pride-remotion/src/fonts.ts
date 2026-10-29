import {continueRender, delayRender, staticFile} from 'remotion';

// Loads the bundled Poppins weights before any frame renders (no network needed).
let started = false;
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading Poppins');
  Promise.all(
    [500, 600, 700, 800].map((w) =>
      new FontFace('Poppins', `url(${staticFile(`fonts/poppins-latin-${w}-normal.woff2`)})`, {weight: String(w)})
        .load()
        .then((f) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(f)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};

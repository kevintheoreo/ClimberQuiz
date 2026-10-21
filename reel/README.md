# Stats reel

36-second Instagram Reel (1080x1920, 30fps) showing quiz results: total takers, the cast, the rarest type, the leaderboard, the top-3 podium, visitor countries and a call to action. It uses the share card's visual style.

This folder is not part of the web app. Nothing in `src/` imports it, so it is never included in the production build, and the generated `.mp4`/`.wav` are gitignored.

- `reel.js`: the canvas animation. Each frame is a pure function of time.
- `music.py`: original soundtrack synthesized with numpy (120 BPM, scene cuts on bar lines).
- `render.mjs`: renders frames in headless Chromium (Playwright) and muxes with ffmpeg.
- `index.html`: live preview page with play/scrub controls.

## Generating the MP4

### Prerequisites

- Python 3 with `numpy` (`pip install numpy`)
- Node 18+
- `ffmpeg` on your PATH (with libx264 and aac, which standard builds include)
- Playwright with Chromium. It is not in `package.json`, to keep app dependencies clean:
  ```sh
  npm install --no-save playwright
  npx playwright install chromium
  ```
- Internet access while rendering (the fonts load from Google Fonts)

### Steps

Run these from the repo root:

```sh
python3 reel/music.py     # -> reel/out/music.wav (about 13s)
node reel/render.mjs      # -> reel/out/climbertype-stats-reel.mp4 (about 1.5 min)
```

`music.wav` is gitignored, so on a fresh checkout you must run `music.py` before `render.mjs`.
Upload `reel/out/climbertype-stats-reel.mp4` to Instagram.

## Changing the content

- **Wording and stats:** edit `reel.js`. The numbers (`TOTAL`, `RESULTS`, `COUNTRIES`) and the site URL (`SITE_URL`) are near the top; headlines and captions are in the `scene…` functions.
- Re-run `node reel/render.mjs` afterwards. You only need to re-run `music.py` if you changed the music or timing.
- **Timing:** if you change when a scene starts or ends (`CUTS` in `reel.js`), update the matching cue times in `music.py`, since the music is timed to the scene cuts. The video length is `DURATION` in `reel.js` and `render.mjs`, and `DUR` in `music.py`.

## Checking your work

Render still frames at specific seconds instead of the full video:

```sh
node reel/render.mjs 12 22.5      # -> reel/out/still-12.00.jpg, still-22.50.jpg
```

To preview live in the browser with sound, serve the repo root (e.g. `npx serve .`) and open `/reel/`. This needs `reel/out/music.wav` to exist.

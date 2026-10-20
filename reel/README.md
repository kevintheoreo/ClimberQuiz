# Stats reel

36-second Instagram Reel (1080x1920, 30fps) showing quiz results: total takers, the cast, the rarest type, the leaderboard, the top-3 podium, visitor countries and a call to action. It uses the share card's visual style.

- `reel.js`: the canvas animation. Each frame is a pure function of time.
- `music.py`: original soundtrack synthesized with numpy (120 BPM, scene cuts on bar lines).
- `render.mjs`: renders frames in headless Chromium (Playwright) and muxes with ffmpeg.

```sh
python3 reel/music.py          # -> reel/out/music.wav
node reel/render.mjs           # -> reel/out/climbertype-stats-reel.mp4
node reel/render.mjs 12 22.5   # stills at given seconds, for checking
```

To preview live in the browser with sound, serve the repo root (e.g. `npx serve .`) and open `/reel/`.
The stats are hard-coded at the top of `reel.js`. If you change scene timings, update the cue times in `music.py` to match.

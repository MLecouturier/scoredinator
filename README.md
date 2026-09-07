# ScoreDinatoR

ScoreDinatoR is a graphic score generator for collective improvisation.

Each player is assigned a path made of random waveforms (sine ∿, square ⊓, triangle ⋀) drawn across a time grid. The score is revealed progressively: during playback, a moving mask sweeps the score in real time over the chosen duration, so that all the players read and play their line together.

No dependencies to install, no build required: everything runs in the browser from static files.

## Usage

Open `index.html` in a modern browser (or serve the folder with any static web server).

1. Set the number of **players** (1–6), the **duration** of the piece (3–12 minutes) and the number of **steps** on the grid, or use the `?` buttons to pick random values.
2. Enable the waveform shapes you want (∿, ⊓, ⋀) — at least one.
3. Click **Draw** to generate the paths. Click again to draw more paths while there is room left on the grid.
4. Click **Play** to start the performance: after a short countdown, the mask moves across the score for the whole duration of the piece. **Rewind** resets the mask to the beginning.
5. **Split** switches to a split view with one lane per player.
6. The `–` slider adjusts the stroke width, the moon icon toggles dark mode.
7. Print with the browser's native command (Ctrl+P / Cmd+P): the score is automatically rescaled to A4 landscape with a 12 mm margin (a single page, header and controls hidden). The on-screen layout is restored after printing.

The score is fully responsive: resizing the window rescales the drawing and the timeline.

### Share a score

The current state of the score (settings and generated paths) is encoded directly in the URL, which is updated as you draw. Copy the address bar and paste it in a new window (or bookmark it, send it to other players...) to retrieve exactly the same score, automatically rescaled to the size of the new window.

## Development

Plain HTML/CSS/JS, using [SVG.js](https://svgdotjs.github.io/) for drawing and the Web Animations API for the mask.

- `js/scoredinator.js` — application source
- `js/scoredinator.min.js` — minified build loaded by `index.html` (regenerate with `npx terser js/scoredinator.js --compress --mangle --output js/scoredinator.min.js`)
- `scss/custom.scss` — styles, compiled to `css/custom.css` and `css/custom.min.css`

## Credits & License

Fonts: Mouvement Direct, Not Courrier Sans.

Copyright (c) MLecouturier — released under the [GNU AGPL v3](LICENSE).

# gptdiff · NanoGPT — single file

One self-contained `index.html`. No server, no build, no install. It uses
[gptdiff-js](https://github.com/255BITS/gptdiff-js) (loaded from `esm.sh`) to **generate a
unified diff and smartapply it** with NanoGPT's `xiaomi/mimo-v2.5-pro-ultraspeed`, streaming
progress (live tokens + USD cost) as it works.

```
index.html ──▶ NanoGPT  (auth, diff, apply — all from the browser)
```

## Use it

Open the page, authenticate one of two ways, then edit the file + goal and hit **Diff & apply**:

- **Sign in with NanoGPT** — browser OAuth (PKCE). Requires the page be served over http
  (loopback) or https, since OAuth redirects there. The key is stored in `localStorage`.
- **paste key** — paste a key from <https://nano-gpt.com> → Settings → API. Works even when
  the file is opened directly (`file://`).

### Serve it locally (for OAuth)

```bash
npx serve .      # then open the printed http://localhost:3000
```

Use the `localhost` URL (the page auto-switches `127.0.0.1` → `localhost` to match NanoGPT's
loopback handling). Opening via `file://` works too, but only with the **paste key** option.

### Deploy it

It's a static file — drop it on any HTTPS host and OAuth works cleanly (no loopback quirks):

```bash
npx netlify deploy --prod --dir .     # or Cloudflare Pages / Vercel / GitHub Pages / Surge
```

## How it works

- **Auth** — browser PKCE: registers a client, redirects to NanoGPT consent, exchanges the
  code for a key (all NanoGPT auth endpoints are CORS-open). Key cached in `localStorage`.
- **Diff → apply** — `generateDiff(buildEnvironment(files), goal)` then `smartapply(diff, files)`,
  with a streaming `callLlm` injected so the diff/file build up live and exact token/cost
  figures come from NanoGPT's `x_nanogpt_pricing`.
- A no-op (empty/unparseable diff, or unchanged result) is shown explicitly, not silently.

## Realtime video overlay (`overlay.html`)

A second demo that shows gptdiff editing a **multi-file project**: a broadcast/stream
overlay built from SVG layers + a [GSAP](https://gsap.com) timeline + a JSON config + the
preview that stitches them together. Describe a change in the **Goal** box and gptdiff
rewrites *all* of them — **adding or removing files** as needed — and the looping preview
re-renders live (opening → middle hold → closing, on repeat).

There is **no real filesystem**. The "project" is an in-memory `{ path: content }` map (a
virtual FS) held in the page. `smartapply` returns a fresh map; the harness diffs it against
the current one (added / removed / changed) and swaps the result into the DOM by rebuilding a
single sandboxed `<iframe srcdoc>`. A tiny **mini-bundler** inlines every file into that one
document:

- `<!-- include-config: config.json -->` → `<script>window.OVERLAY_CONFIG = {…}</script>`
- `<!-- include: layers/foo.svg -->` → the raw SVG markup (so GSAP can animate its shapes)
- local `<script src="overlay.js">` → inlined; the GSAP CDN `<script>` is left untouched

So it stays a plain static HTML file — open it directly (`file://`) or serve it; nothing is
ever written to disk.

**Export bundle** runs the same bundler and downloads `overlay-bundle.html`: one self-contained,
transparent 1920×1080 file you can drop into an OBS *Browser Source*, screen-record, or hand to
a video editor.

The seed project lives in `overlay/` (`preview.html`, `overlay.js`, `config.json`,
`layers/*.svg`). When served, `overlay.html` fetches those files; opened via `file://` it falls
back to an identical copy embedded in the page.

```bash
npx serve .      # then open http://localhost:3000/overlay.html
```

## Files

- `index.html` — the single-file diff → smartapply demo (builds a playable game).
- `overlay.html` — the multi-file realtime video-overlay demo (virtual FS + live preview + export).
- `overlay/` — the seed overlay project (SVG layers, GSAP timeline, JSON config, preview).

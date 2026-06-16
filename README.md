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

## Files

- `index.html` — the whole thing.

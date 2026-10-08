# DOJO Ventures Command Center

A venture portfolio and Kanban dashboard backed by a local Codex subscription worker. Create venture workspaces, assign research or artwork jobs, review actual outputs, and track founder actions.

## Features

- Expandable venture portfolio with scrolling and an All ventures directory.
- Fixed-height Kanban board with independently scrolling columns.
- Venture-specific agent conversations, notes and founder to-dos.
- Native Codex image generation and live research using a signed-in subscription.
- Created work library at `/created`, categorized by artwork, reports, code drafts and venture notes.
- Evidence gates distinguish approved reports from delivered implementation and a completed venture.

## Run locally

Requires Node.js 22.13+ and npm. Use the installed Codex CLI signed in with ChatGPT for agent execution; no OpenAI API key is required for the native worker route.

```sh
npm ci
npm run build
npx wrangler d1 execute DB --local --persist-to .wrangler/state --config dist/server/wrangler.json --file drizzle/0000_sturdy_tusk.sql
npm run dev
```

Run the database initialization once on a fresh checkout. Open `http://127.0.0.1:5173/`. In another terminal:

```sh
npm run worker
```

On macOS, after initial setup, `Open-DOJO.command` launches both processes. Keep the Mac awake and the worker running for queued work to progress. If your Codex CLI is installed elsewhere, set `DOJO_CODEX_BIN` to its executable path before starting the worker. The default path targets the ChatGPT desktop app on macOS.

## What the worker does

Research jobs use live web search. Artwork jobs use built-in image generation and return up to three images per run to Review. Files are copied into `public/generated` so previews work while the worker is offline. The dashboard server must still be running. Code drafts are not an executed or tested application; general build work, account creation and publishing remain separately handled work.

## Data and privacy

Local venture state lives in the ignored `.wrangler` database. This repository contains source, schema, starter venture definitions and the saved prototype image, not the current personal board database, agent logs or credentials. Private worker configuration, API keys and environment files are ignored. Back up `.wrangler/state` separately if you need to preserve your board.

## Hosting

The app uses React, vinext/Vite and Cloudflare-compatible D1 storage. `.openai/hosting.json` identifies the existing private ChatGPT Sites project. GitHub is source backup; pushing does not publish the dashboard. ChatGPT Sites deployment was blocked by the desktop approval policy at the time of this source save. A hosted dashboard also needs a securely configured Mac worker and durable uploads for new generated files; the local public-file copy route is intended for local operation.

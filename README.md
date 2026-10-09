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

## Automatic local operation

`node scripts/dojo-autostart.mjs install` installs two per-user macOS login services: `com.dojo.command.server` and `com.dojo.command.worker`. They run at login, monitor the local dashboard/worker, and restart after an exit. Logs live in `.dojo-service/server.log` and `.dojo-service/worker.log`. Use `node scripts/dojo-autostart.mjs status` to inspect them and `node scripts/dojo-autostart.mjs remove` to disable and uninstall them. Keep this checkout at its installed path. No Terminal window is needed once installed. The Mac must be awake, signed in and online; queued work waits during sleep and resumes afterward.

Enable **Automatic Backlog pickup** on the mission board to run eligible research and artwork missions after the existing queue. The worker polls every 10 seconds; the board refreshes every 6 seconds. The worker picks one Backlog mission at a time even while the browser is closed. Turn the toggle off to pause new Backlog pickups; manually queued and already running missions continue. Subscription limits still apply.

Goals, founder tasks, general implementation work, missions with existing deliveries, failed/previously attempted missions, and missions with incomplete prerequisites are held. Automatic runs return to Review, never directly to Done. Prerequisites can be stored as `dependsOn` task IDs and `requiredTodoIds` founder-action IDs. Known prototype-review and publishing dependencies are preserved for older saved missions. Interrupted delivery uploads are retried from saved local files.

## Approved build sessions


The worker now supports local build jobs using the signed-in Codex CLI, workspace-write sandbox, real shell/file tools, machine-readable events and structured delivery. No API key fallback is used. Build outputs go to `~/Projects/DOJO-<venture>/<job-id>/`, keeping each session separate from existing projects. Builds use synthetic inputs and local files; account creation, publication, spending and transactions remain founder actions.

Accepting a plan with linked builds automatically authorizes those builds. Existing Competitor Pulse and Bid Radar plan/build links are supported, including plans accepted before the upgrade. Other reports offer **Approve report & build a prototype**, which creates an approved linked build. New local build missions have **Approve & start build**. Direct build approval queues immediately. Approved linked builds are picked up independently of the research/artwork Backlog toggle. Missing prerequisites still block pickup.

A successful delivery requires actual implementation files, a `verify.mjs` harness, a recorded successful `node verify.mjs` command event, and a downloadable ZIP containing only verified deliverable files. Builds return to Review. **Accept verified build** records the project and verification evidence before Done. Failed runs remain open for an explicit retry. General build jobs have a 20-minute execution timeout; interrupted claims expire after 30 minutes.

Created work has a **Built projects** category showing project paths, bundles and verification output. Suggested founder actions from builds are added to the venture to-do list. The original saved reports remain available. Automatic execution does not establish customer demand, publish a site, or complete the venture goal.

Checks: `node scripts/test-backlog.mjs` and `node worker/test-build-runner.mjs` for the local split-folder setup.

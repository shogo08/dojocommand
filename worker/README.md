# DOJO subscription worker

Uses the locally signed-in Codex CLI and subscription limits, without an OpenAI API key. Start locally with `node worker.mjs --local-preview`. Keep your Mac awake and online. The dashboard’s macOS login services can keep this worker running automatically, without an open Terminal window. Manual runs stop with Ctrl+C.

Research jobs use live web search and return source-linked reports. Artwork jobs use built-in image generation, produce at most three images per run, verify saved files and return them to Review. Choose Artwork in New mission or Generate artwork in Agent desk. Actual generated files appear in the task popup; partial samples do not complete a full book or launch the venture.

The worker uses isolated venture/job folders, workspace-write execution, no inherited user config, and disables shell, connected apps, browser/computer use and plugins. It can generate images and research, but account creation, payment details, publication and transactions remain founder actions. Implementation tasks beyond artwork still need a build session.

Files and reports remain under runs/. Generated images are copied into the dashboard’s public/generated folder and served by the dashboard itself. Previews continue working while the agent worker is offline. The dashboard server must be running. Saved files remain after the worker stops. Subscription limits apply; image generation consumes more usage than ordinary text turns. There is no billed API fallback.

New ventures are supported through the saved portfolio, not a fixed eight-venture whitelist. The hosted private Site config contains a service credential; Codex sign-in stays on the Mac. The dashboard currently runs locally.

The mission-board Automatic Backlog pickup toggle allows eligible, unattempted research and artwork missions to start after queued work, with dependency checks. A failed run waits for a manual retry rather than repeatedly consuming usage. Saved delivery uploads are recovered at startup.

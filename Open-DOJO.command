#!/bin/zsh
DOJO_PROJECT_DIR="${0:A:h}"
cd "$DOJO_PROJECT_DIR" || exit 1
if /bin/launchctl print "gui/$(id -u)/com.dojo.command.worker" >/dev/null 2>&1; then
 open http://127.0.0.1:5173/
 print "DOJO runs automatically in the background. This window can close."
 exit 0
fi
if ! curl --silent --fail http://127.0.0.1:5173/api/studio >/dev/null; then
 npm run dev &
 DOJO_SERVER_PID=$!
fi
npm run worker &
DOJO_WORKER_PID=$!
trap 'kill "$DOJO_WORKER_PID" 2>/dev/null; if [[ -n "$DOJO_SERVER_PID" ]]; then kill "$DOJO_SERVER_PID" 2>/dev/null; fi' EXIT INT TERM
open http://127.0.0.1:5173/
print "DOJO is running. Keep this window open. Ctrl+C stops the worker."
wait "$DOJO_WORKER_PID"

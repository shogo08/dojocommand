#!/bin/zsh
DOJO_AUTOMATION_DIR="${0:A:h}"
cd "$DOJO_AUTOMATION_DIR" || exit 1
node scripts/dojo-autostart.mjs install
DOJO_INSTALL_RESULT=$?
if [[ "$DOJO_INSTALL_RESULT" == 0 ]]; then
 print "DOJO now starts at login and runs in the background. You can close this window."
 open http://127.0.0.1:5173/
else
 print "Installation did not finish. See the error above."
fi
read "?Press Enter to close."
exit "$DOJO_INSTALL_RESULT"

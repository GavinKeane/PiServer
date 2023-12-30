#!/bin/bash
if pgrep -f "Windscribe" &>/dev/null; then
	echo "CONNECTED"
else
	echo "DISCONNECTED"
fi

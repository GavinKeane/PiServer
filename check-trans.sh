#!/bin/bash
if pgrep -x "transmission-gt" &>/dev/null; then
	echo "yes"
else
	echo "no"
fi

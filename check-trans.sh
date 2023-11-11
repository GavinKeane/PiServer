#!/bin/bash
if pgrep -x "transmission-gt" &>/dev/null; then
	echo "tyes"
else
	echo "tno"
fi

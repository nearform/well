#!/bin/bash
trap 'kill $$' SIGINT

echo CONNECTING TO $1:$2
CONNECTED=""
while [[ "$CONNECTED" = "" ]]; do
    CONNECTED=$(nc -z -v -w 100 $1 $2 2>&1)
    CONNECTED=$(echo $CONNECTED | grep "succ")
    if [[ "$CONNECTED" = "" ]]; then
      printf '.'
      sleep 0.4
    fi
done
echo
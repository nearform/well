#!/bin/bash
trap 'kill $$' SIGINT
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DESC=$1
PORT=$2

echo
echo INSPECTING $DESC AT PORT $PORT
while [[ "$IP" = "" ]]; do
    HEX=$(echo $(docker ps | grep $PORT) | cut -d" " -f1)
    if [[ "$HEX" != "" ]]; then
      IP=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' $HEX)
    fi

    if [[ "$IP" = "" ]]; then
      printf '.'
      sleep 0.4
    fi
done
echo

echo $DESC DETAILS:
echo $DESC DOCKER HEX "$HEX"
echo $DESC ADDR "$IP:$PORT"
echo

echo "$HEX" > $PREFIX/temp.hex.out
echo "$IP" > $PREFIX/temp.ip.out
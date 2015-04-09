#!/bin/bash
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [[ "$VAR" == *" -p "* ]]; then
  PORT=$(bash $PREFIX/split.sh "$VAR" " -p " 2)
  PORT=$(bash $PREFIX/split.sh "$PORT" ":" 0)
fi
if [[ "$PORT" != "" ]]; then
  bash $PREFIX/util/docker-inspect.sh "IMAGE" $DB_PORT
  HEX=$(bash $PREFIX/util/read-inspect.sh hex)
  IP=$(bash $PREFIX/util/read-inspect.sh ip)
  $PREFIX/wait-connect.sh $IP $PORT
fi
#!/bin/bash
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DB=$1

declare -a LINKLESS=("mem" "jsonfile")
LINKED=true
for IMG in ${LINKLESS[@]}
do
    if [[ "$IMG" = "$DB" ]]; then LINKED=false
    fi
done
TITLE="App"
if [[ "$LINKED" = false ]]; then
  TITLE="App & Database - $DB"
else
  EXTRAS="--link $DB-inst:$DB-link -e db=$DB-store"
fi

DIMG=$(bash $PREFIX/conf-obtain.sh dockimages -a)
IMGNO=$(bash $PREFIX/split.sh "$DIMG" "@" 0)

for (( I=1; I<=IMGNO; I++ ))
do
  IMG=$(bash $PREFIX/split.sh "$DIMG" "@" $I)
  echo bash docker run $EXTRAS $IMG
  if [[ $IMG == *"-d"* ]]; then docker run $EXTRAS $IMG
  else
    nohup gnome-terminal --title="$TITLE" --disable-factory -x bash -c "docker run $EXTRAS $IMG ; echo "DONE"; read" >/dev/null 2>&1 &
  fi

  if [[ "$IMG" == *"-p"* ]]; then
    PORT=$(bash $PREFIX/split.sh "$IMG" " -p " 2)
    PORT=$(bash $PREFIX/split.sh "$PORT" ":" 0)

    if [[ "$PORT" != "" ]]; then
      bash $PREFIX/docker-inspect.sh "IMAGE" $PORT
      HEX=$(bash $PREFIX/read-inspect.sh hex)
      IP=$(bash $PREFIX/read-inspect.sh ip)
      bash $PREFIX/wait-connect.sh $IP $PORT
    fi
  fi
done
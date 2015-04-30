#!/bin/bash
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKDIR=$(bash $PREFIX/../util/conf-obtain.sh app workdir)

DFILES=$(bash $PREFIX/conf-obtain.sh dockbuilds -a)
FILENO=$(bash $PREFIX/split.sh "$DFILES" "@" 0)

for (( I=1; I<=FILENO; I++ ))
do
  FILE=$(bash $PREFIX/split.sh "$DFILES" "@" $I)
  IMGNAME=$(bash $PREFIX/split.sh "$FILE" " " 0)
  IMGLOC=$(bash $PREFIX/split.sh "$FILE" " " 1)
  docker build --force-rm -t $IMGNAME $WORKDIR/$IMGLOC
done
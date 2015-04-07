#!/bin/bash
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

PROMPT=false
for VAR in "$@"
do
    if [ "$VAR" = "-prompt" ]; then PROMPT=true
    fi
done

echo
echo CLEANING AFTER DB TEST
echo NEED SUDO TO ERASE ORPHANED DOCKER VOLUMES
echo THEY TAKE ENORMOUS AMOUNTS OF SPACE
sudo echo
echo ERASING DOCKER BLOAT
echo /var/lib/docker/vfs/dir
sudo rm -rf /var/lib/docker/vfs/dir

echo ERASING TEMP DB
echo $PREFIX/../unit-db
rm -rf $PREFIX/../unit-db

bash $PREFIX/utils/kill-containers.sh
bash $PREFIX/utils/kill-other-gnome.sh

if [ "$PROMPT" = true ]; then
    echo
    echo "NOTE: IT IS SAFE TO [CTRL]+[C] NOW"
    echo "ALL CLEAR. TAP [ANY] KEY TO CONTINUE"
    read
fi
echo
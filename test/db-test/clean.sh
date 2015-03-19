#!/bin/bash
PREFIX="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

PROMPT=false
for VAR in "$@"
do
    if [ "$VAR" = "-prompt" ]; then PROMPT=true
    fi
done

echo CLEANING AFTER DB TEST
echo NEED SUDO TO ERASE ORPHANED DOCKER VOLUMES
echo THEY TAKE ENORMOUS AMOUNTS OF SPACE
sudo echo /var/lib/docker/vfs/dir
sudo rm -rf /var/lib/docker/vfs/dir

echo ERASING TEMP DB
echo $PREFIX/../unit-db
rm -rf $PREFIX/../unit-db

bash $PREFIX/kill-containers.sh
bash $PREFIX/kill-other-gnome.sh

if [ "$PROMPT" = true ]; then
    echo
    echo "NOTE: IT IS SAFE TO [CTRL]+[C] NOW"
    echo "ALL CLEAR. TAP [ANY] KEY TO CONTINUE"
    read -p "" -n 1 -s
    echo
fi

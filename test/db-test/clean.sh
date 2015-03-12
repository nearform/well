#!/bin/bash
PREFIX="./"

PROMPT=false
for VAR in "$@"
do
    if [ "$VAR" = "-prompt" ]
        then PROMPT=true
    fi
done

echo CLEANING AFTER DB TEST
echo NOTE: SUDO IS REQUIRED TO ERASE TEMP FILES
sudo echo

echo ERASING META
echo ../unit-db
sudo rm -rf ../unit-db
echo /home/deploy/test
sudo rm -rf /home/deploy/test

bash $PREFIX/kill-containers.sh
bash $PREFIX/kill-other-gnome.sh

if [ "$PROMPT" = true ]
    then
    read -p "ALL CLEAR" -n 1 -s
    echo
fi

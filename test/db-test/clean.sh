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
echo ../addr.out
sudo rm -rf ../addr.out
echo /home/deploy/test
sudo rm -rf /home/deploy/test

bash $PREFIX/kill-containers.sh
bash $PREFIX/kill-other-gnome.sh
killall mongod

if [ "$PROMPT" = true ]
    then
    read -p "ALL CLEAR" -n 1 -s
    echo
fi

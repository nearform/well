#!/bin/bash

echo CLEANING AFTER DB TEST
echo NOTE: SUDO IS REQUIRED TO ERASE TEMP FILES
sudo echo

echo ERASING META
echo ../../unit-db
sudo rm -rf ../../unit-db
echo /home/deploy/meta
sudo rm -rf /home/deploy/meta
echo /home/deploy/test
sudo rm -rf /home/deploy/test

bash kill-containers.sh
bash kill-other-gnome.sh

read -p "ALL CLEAR" -n 1 -s
echo

#!/bin/bash

echo CLEANING AFTER DB TEST
echo NOTE: SUDO IS REQUIRED TO ERASE TEMP FILES
sudo echo

echo ERASING META

echo ../../unit-db
sudo rm -rf ../../unit-db
if [ "$1" == "local" ]
    then
    echo ../../node_modules/seneca-db-test-harness/meta
    sudo rm -rf ../../node_modules/seneca-db-test-harness/meta
    echo ../../node_modules/seneca-db-test-harness/db
    sudo rm -rf ../../node_modules/seneca-db-test-harness/db
    echo ../addr.out
    sudo rm ../addr.out
    sh kill-servers.sh
elif [ "$1" == "docker" ]
    then        
    echo /home/deploy/meta
    sudo rm -rf /home/deploy/meta
    echo /home/deploy/test
    sudo rm -rf /home/deploy/test
    bash kill-containers.sh
fi

bash kill-other-gnome.sh
read -p "ALL CLEAR" -n 1 -s
echo

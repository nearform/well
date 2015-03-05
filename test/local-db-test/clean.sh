#!/bin/bash

sh kill-servers.sh
echo ERASING META
echo ../../node_modules/seneca-db-test-harness/meta
sudo rm -rf ../../node_modules/seneca-db-test-harness/meta
echo ../../node_modules/seneca-db-test-harness/db
sudo rm -rf ../../node_modules/seneca-db-test-harness/db
echo ../addr.out
sudo rm ../addr.out
read -p "ALL DONE. HAVE A NICE DAY" -n 1 -s
killall gnome-terminal

#!/bin/bash

echo ERASING META
echo /home/deploy/meta
sudo rm -rf /home/deploy/meta
echo /home/deploy/test
sudo rm -rf /home/deploy/test
bash kill-containers.sh
bash kill-other-gnome.sh
read -p "ALL DONE. HAVE A NICE DAY" -n 1 -s
echo 
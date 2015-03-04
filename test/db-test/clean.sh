echo ERASING META
echo /home/deploy/meta
sudo rm -rf /home/deploy/meta
echo /home/deploy/test
sudo rm -rf /home/deploy/test
echo KILLING CONTAINERS
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
echo ALL DONE. HAVE A NICE DAY
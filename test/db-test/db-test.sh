echo KILL CONTAINERS
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
echo BUILDALL
docker pull kamilmech/seneca-db-web
gnome-terminal -x bash -c "sh db-web.sh; exec $SHELL"
cd ../..
docker build --force-rm -t well-app .
cd test/db-test
gnome-terminal -x bash -c "sh app.sh; exec $SHELL"
echo STANDBY BEFORE TEST
sleep 5
echo TESTING
npm test

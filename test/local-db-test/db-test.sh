sh kill-servers.sh
cd ../../node_modules/seneca-db-test-harness
gnome-terminal -x bash -c "node seneca-db-test-harness.js --db=jsonfile-store; exec $SHELL"
cd ../..
gnome-terminal -x bash -c "node app.js --env=development; exec $SHELL"

echo STANDBY BEFORE TEST
sleep 5
echo TESTING
npm test

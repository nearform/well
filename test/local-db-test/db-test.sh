sh kill-servers.sh
cd ../../node_modules/seneca-db-test-harness
nohup gnome-terminal --disable-factory -x bash -c "node seneca-db-test-harness.js --db=jsonfile-store" >/dev/null 2>&1 &

sleep 1

cd ../..
nohup gnome-terminal --disable-factory -x bash -c "node app.js --env=development" >/dev/null 2>&1 &

echo STANDBY BEFORE TEST
sleep 5
echo TESTING
npm test

cd test/local-db-test
read -p "TAP ANY KEY TO CLEAN UP" -n 1 -s
echo 
bash clean.sh
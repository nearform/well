bash run.sh [FLAGS]
it is completely safe to run while other run is in operation as it will clean the old one first
you can also run it manually:
bash clean.sh

-------

dbs:
  mem
  jsonfile
  redis
  postgres
  mysql
* when no dbs specified, it tests them all

flags:
  -dbs        specify dbs
  -fd         force docker pull
  -fb         force app build
  -tu         unit test only
  -ta         acceptance test only
  -nt         no test, just run everything

e.g.

bash db-test.sh -dbs mongo
bash db-test.sh -dbs jsonfile -ta
bash db-test.sh -fd -fb

Can be used to test same db several times!
bash db-test.sh -dbs mongo mongo mongo

works with npm!
lets say you add entry in package.json scripts:
"dtest":"bash test/db-test/run.sh"
then this works:

npm run dtest
npm run dtest --args="-dbs redis mongo -fb -tu" 
npm run dtest --args="-dbs mongo mongo mongo -fb -tu" 

you can add clean command as well to make your life easier:
"dtest":"bash test/db-test/clean.sh"

npm run clean

-------

note: Unexpected End of Input in jsonfile-store test is a result of internal jsonfile db bug

-------

adding new DBs:

* run.sh
1) Add entry to DBS array
2) Check docker image name
3) Set port
* docker-db.sh
4) Set base(optional)
-> For SQL-based DBs you want to make init script that loads schema file
* app
5) Go to your app and config it to connect to the DB
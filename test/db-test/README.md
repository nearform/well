bash run.sh [DB(optional)] [FLAGS]

dbs:
  mem-store
  jsonfile-store
* when no db specified, it tests them all

flags:
  -fd         force docker pull
  -fb         force app build
  -tu         unit test only
  -ta         acceptance test only
  -nt         no test, just run everything

e.g.

bash db-test.sh mongo-store
bash db-test.sh jsonfile-store -ta
bash db-test.sh -fd -fb

-------

Note: Unexpected End of Input in jsonfile-store test is a result of internal jsonfile db bug

-------

Adding new DBs:

* run.sh
1) Add entry to DBS array
2) Check docker image name
3) Set port
* docker-db.sh
4) Set base(optional)
-> For SQL-based DBs you want to make init script that loads schema file
* app
5) Go to your app and config it to connect to the DB
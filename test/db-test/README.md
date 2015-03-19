bash db-test.sh [DB(optional)] [FLAGS]

dbs:
  mem-store
  jsonfile-store
* when no db specified, it tests them all

flags:
  -fd         force docker pull
  -fb         force app build
  -tu         unit test only
  -ta         acceptance test only

e.g.

bash db-test.sh mongo-store
bash db-test.sh jsonfile-store -ta
bash db-test.sh -fd -fb

-------

Note: Unexpected End of Input in jsonfile-store test is a result of internal jsonfile db bug
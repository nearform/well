bash db-test.sh [DB(optional)] [FLAGS]

dbs:
  mem-store
  jsonfile-store
* when no db specified, it tests them all
* if using flags, insert 'all' for db

flags:
  -fd         force docker pull
  -fb         force app build

  e.g.

  bash db-test.sh local 
  bash db-test.sh docker -fd -fb
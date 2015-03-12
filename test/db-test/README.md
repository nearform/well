bash db-test.sh [DB(optional)] [FLAGS]

dbs:
  mem-store
  jsonfile-store
* when no db specified, it tests them all
* if using flags, insert 'all' for db

flags:
  -fd         force docker pull
  -fb         force app build
  -tu         unit test only
  -ta         acceptance test only

  e.g.

  bash db-test.sh mongo-store
  bash db-test.sh jsonfile-store -ta
  bash db-test.sh all -fd -fb
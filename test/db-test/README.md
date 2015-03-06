bash db-test.sh
  first arg takes 'local' or 'docker'

flags:
  -fd         force docker pull
  -fb         force app build

  e.g.

  bash db-test.sh local 
  bash db-test.sh docker -fd -fb
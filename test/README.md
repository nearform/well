to run automated db-testing go to db-test folder and run
  sh db-test.sh
you can run
  bash clean.sh
after test to make your life easier

--------------

MANUAL MONGO

db testing
- do not run unit and acceptance tests at the same time
- make sure options.well.js db field is the name of db
  preferably with postfix -store

to run unit test using localhost:
- uncomment localhost db options in options.well.js
- comment out ENV db options in options.well.js
- uncomment test in package.json
- comment out posttest in package.json

- open terminal 1:
  sudo mongod

- open terminal 2:
  npm test

to run acceptance test using docker:
- uncomment ENV db options in options.well.js
- comment out localhost db options in options.well.js
- uncomment posttest in package.json
- comment out test in package.json

- open terminal 1. first command rebuilds fake db
  node app.js --env=clear
  docker run --rm -p 27017:27017 -p 28017:28017 --name mongo-inst mongo --httpinterface

- open terminal 2
  docker build --force-rm -t well-app .
  docker run -v /home/usr/work/workbench/Well/test:/test -p 3333:3333 --link mongo-inst:mongodb well-app
                          ^
             Insert your/work/directory/Well/test
             instead of this path
             Must be an absolute path

- open terminal 3
  npm test

--------------

running
node app.js --env=clear
rebuilds fake db

--------------

docker run -v /home/deploy/meta:/meta --rm --name db-web-inst db-web
docker run -v /home/usr/work/workbench/Well/test:/test -v /home/deploy/meta:/meta -p 3333:3333 --link db-web-inst:db-web well-app

--------------

1) MONGO

*INIT ISSUES

To be investigated:

seneca-vcache doesn't like working with both seneca-mongo-store and memcached-cache IN DOCKER.
It causes init failure on seneca-user via timeout.
It accepts to run with one of these, but not both.

It gets seneca entity save function stuck on seneca.act which refers save(itself).
Input data to the mentioned function seems correct when compared to seneca-mem-store.
However, returns timeout error instead of entity.

app.js code fragments to be examined

  // register the seneca-memcached plugin - this provides access to a cache layer backed by memcached
  // seneca.use('memcached-cache')

  // register the seneca-vcache plugin - this provides version-based caching for 
  // data entities over multiple memcached servers, and caches by query in addition to id
  // seneca.use('vcache')
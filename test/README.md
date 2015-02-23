
// CMDS used to run db tests:

// window 1
docker run --rm -p 27017:27017 -p 28017:28017 --name our-mongo mongo --httpinterface

// window 2
docker build --force-rm -t well-app .
docker run -v /home/km/work/workbench/Well/test:/test -p 3333:3333 --link our-mongo:mongodb well-app

// window 3
npm test

--------------

running node app.js --env=clean erases db

--------------

1) MONGO

All unit tests timeout, still working on code for it

*INIT ISSUES

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
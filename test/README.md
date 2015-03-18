to run automated db-testing go to db-test folder

--------------

running
node app.js --clear=true
rebuilds fake db

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
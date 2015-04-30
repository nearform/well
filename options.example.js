/* Example options file for well app.
 * This is loaded using require(...) so it just an ordinary node module
 * which means you can use JavaScript to construct your options,
 * and avoid repetition.
 *
 * This file is loaded by the seneca builtin options plugin. The options plugin matches
 * plugin names to top level property names in this file. For example, the well plugin, which this 
 * app defines, it given the options contained in the well property below.
 * As a convenience, the seneca- prefic can be dropped for standard seneca plugins.
 */

/* This file is PUBLIC DOMAIN. You are free to cut-and-paste to start your own projects, of any kind */
"use strict";

// set true to enable unstricted access to /data-editor from localhost
var local = false


module.exports = {

  // admin options
  admin:{local:local},

  // generic options
  main: {
    // HTTP listen port
    // get from PORT environment variable if defined
    port:process.env['PORT']||3333,

    // uncomment to run development code
    // public:'/front'

    // runs production version by default
    public:'/front/build/well/production'
  },

  // options for seneca-mongo-store
  'mongo-store':{
    // uncomment if using mongo authentication
    //user:'USERMAME',
    //pass:'PASSWORD',
    host:process.env.MONGO_LINK_PORT_27017_TCP_ADDR || 'localhost',
    port:process.env.MONGO_LINK_PORT_27017_TCP_PORT || 27017,
    name:'well'
  },

  // options for seneca-postgresql-store
  'postgresql-store':{
    username:'admin',
    password:'password',
    host:process.env.POSTGRES_LINK_PORT_5432_TCP_ADDR || 'localhost',
    port:process.env.POSTGRES_LINK_PORT_5432_TCP_PORT || 5432,
    name:'admin', // Because of the way docker image works it has to be same as username
    schema:'/test/dbs/postgres.sql'
  },

  // options for seneca-redis-store
  'redis-store':{
    host:process.env.REDIS_LINK_PORT_6379_TCP_ADDR || 'localhost',
    port:process.env.REDIS_LINK_PORT_6379_TCP_PORT || 6379
  },

  // options for seneca-mysql-store
  'mysql-store':{
    host:process.env.MYSQL_LINK_PORT_3306_TCP_ADDR || 'localhost',
    port:process.env.MYSQL_LINK_PORT_3306_TCP_PORT || 3306,
    user:'root', // to keep things simple this has to be root
    password:'password',
    name:'admin',
    schema:'/test/dbs/mysql.sql'
  },

  // options for db test
  'dbt':{
      workdir:__dirname,
      // docker images to run.
      // use -d to run without additional terminal.
      // --link and -e db= will be added automatically.
      // if it exposes a port with -p, tester will automatically
      // wait for it to start listening before booting next.
      // use ; to add bash commands to be ran after image stops operating
      // e.g. '-p 3333:3333 well-app ; echo Oh no!; read'
      dockimages:['-p 3333:3333 --rm well-app'],
      // dockerfiles to be rebuilt when -fb is used
      // syntax: [image-tag] [path_to_dockerfile]
      dockbuilds:['well-app .'],
      // extra files to be erased on cleanup
      cleanups:['this/location/this.file.out',
                'temp/not.needed.log',
                'that/dump/folder'] // TODO
  },

  // options for memcached
  memcached:{
    servers:['127.0.0.1:11211']
    // uncomment for two servers in production
    // servers:['10.11.12.13:11211','10.11.12.13:11211']
  },

  // options for seneca-auth
  auth: {
    // where to send user after login etc.
    redirect: {
      login: {

        // this is a single-page app, so just add a hash route for sencha
        win:'#main',
        fail:'#fail'
      }
    },
    
    // require a logged-in user for certain url paths
    restrict:'contains:/player/',

    // authentication service settings
    service: {
      twitter: {
        // callback url - set this to your live site for production
        urlhost:'http://localhost:3333',

        key:    'TWITTER-KEY',
        secret: 'TWITTER-SECRET'
      }
    }
  },

  // options for seneca-data-editor
  'data-editor': {

    // allow localhost access for debugging, if local=true
    admin:{local:local}
  },

  // custom options for the well plugin, which contians the 
  // core business logic of the app
  well:{

    // admin user password, ** CHANGE THIS ** for production
    admin: { pass: 'admin' },

    // set up test users and events for debugging
    dev_setup: {
      users:{ 
        count: 16 
      },
      events:{
        MeetupA:{numteams:1,code:'ma'},
        MeetupB:{numteams:2,code:'mb'},
        MeetupC:{numteams:4,code:'mc'}
      }
    }
  },

}

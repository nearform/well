/* Main application entry point.
 * Run with:
 * $ node app.js
 *
 * Configuration should be in a file named options.well.js in this
 * folder. Create options.example.js to create this file. It is loaded
 * as a node.js module, so you can use JavaScript inside it.
 *
 * The NODE_ENV environment variable is used to start the app in a 
 * development mode for debugging:
 * $ NODE_ENV=dev node app.js
 */

/* This file is PUBLIC DOMAIN. You are free to cut-and-paste to start your own projects, of any kind */
"use strict";


// the easiest way to parse command line arguments
// see https://github.com/substack/node-optimist
var argv = require('optimist').argv


// load the well module, which contains the main app logic and utilities
var well = require('./well')


// get deployment type (set to 'dev' for development)
// use environment variable NODE_ENV, or command line argument --env
var env = process.env['NODE_ENV'] || argv.env


// always capture, log and exit on uncaught exceptions
// your production system should auto-restart the app
// this is the Node.js way
process.on('uncaughtException', function(err) {
  console.error('uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
})


// load the express module
// this provides the basic web server
var express = require('express')


// load the seneca module and create a new instance
// note that module returns a function that constructs seneca instances (just like express)
// so you if you call it right away (as here, with the final () ), you get a default instance
var seneca  = require('seneca')()


// register the seneca builtin options plugin, and load the options from a local file
// you'll normally do this first -
// each seneca plugin can be given options when you register it ("seneca.use"),
// so you don't have to do this, but it does make life easier
// see the options.well.js file for more
// NOTE: unlike other plugins, the options plugin is *synchronous*
// and returns the options immediately
var options = seneca.use('options','options.well.js')


// if developing, use a throw-away in-process database
if( 'dev' == env ) {
  // the builtin mem-store plugin provides the database
  // also enable http://localhost:3333/mem-store/dump so you can debug db contents
  seneca.use('mem-store',{web:{dump:true}})
}

// if not developing, use a mongo database
// NOTE: no code changes are required!
// this is one of the benefits of the using the seneca data entity model
// for more, see http://senecajs.org/data-entities.html
else {
  seneca.use('mongo-store')

  // register the seneca-memcached plugin - this provides access to a cache layer backed by memcached
  seneca.use('memcached')

  // register the seneca-vcache plugin - this provides version-based caching for 
  // data entities over multiple memcached servers, and caches by query in addition to id
  seneca.use('vcache')
}


// register the seneca-user plugin - this provides user account business logic
seneca.use('user')

// register the seneca-auth plugin - this provides authentication business logic
seneca.use('auth')

// register the seneca-perm plugin - this provides permission checking
// set the entity option to true, which means, "check all entities"
seneca.use('perm',{entity:true})

// register the seneca-data-editor plugin - this provides a user interface for data admin
// Open the /data-editor url path to edit data! (you must be an admin, or on localhost)
seneca.use('data-editor')


// register yur own plugin - the well app business logic!
// in the options, indicate if you're in development mode
// set the env option, which triggers creation of test users and events if env == 'dev'
seneca.use('well',{env:env})



// wait for all the seneca plugins to initialize
// in particular, this will wait for the mongo connection to be ready
// the callback to seneca.ready will pass any errors as the first argument
seneca.ready( function(err) {
  if( err ) return console.log(err);

  // create an express app
  var app = express()

  // setup express
  app.use( express.cookieParser() )
  app.use( express.query() )
  app.use( express.bodyParser() )
  app.use( express.methodOverride() )
  app.use( express.json() )

  // you can't use a single node in-memory session store if you want to scale
  // well.js defines a session store that uses seneca entities
  app.use( express.session({ secret: 'CHANGE-THIS', store:well.makestore(seneca) }) )

  // add in the seneca middleware
  // this is how seneca integrates with express (or any connect-style web server module)
  app.use( seneca.service() )

  // serve static files from a folder defined in your options file
  app.use( express.static(__dirname+options.main.public) )  

  // start listening for HTTP requests
  app.listen( options.main.port )

  seneca.log.info('listen',options.main.port)
})



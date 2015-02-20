/* Main application entry point.
 * Run with:
 * $ node app.js
 *
 * Configuration should be in a file named options.well.js in this
 * folder. Create options.example.js to create this file. It is loaded
 * as a node.js module, so you can use JavaScript inside it.
 *
 * The --env command line argument can be used to start the app in a 
 * development mode for debugging:
 * $ node app.js --env=development
 * 
 * The NODE_ENV environment variable can also be used for this purpose
 * $ NODE_ENV=development node app.js
 */

/* This file is PUBLIC DOMAIN. You are free to cut-and-paste to start your own projects, of any kind */
"use strict";

// always capture, log and exit on uncaught exceptions
// your production system should auto-restart the app
// this is the Node.js way
process.on('uncaughtException', function(err) {
  console.error('uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
})

// the easiest way to parse command line arguments
// see https://github.com/substack/node-optimist
var argv = require('optimist').argv

// get deployment type (set to 'development' for development)
// use environment variable NODE_ENV, or command line argument --env
var env = argv.env || process.env['NODE_ENV']

// load the seneca module and create a new instance
// note that module returns a function that constructs seneca instances (just like express)
// so you if you call it right away (as here, with the final () ), you get a default instance
var seneca  = require('seneca')()

// register the seneca builtin options plugin, and load the options from a local file
// you'll normally do this first -
// each seneca plugin can be given options when you register it ("seneca.use"),
// so you don't have to do this, but it does make life easier
// see the options.well.js file for more
var optionsfolder = 'production' == env ? '/home/deploy/' : './'
var options_file = optionsfolder+'options.well.js'
try {
  require('fs').statSync( options_file )
}
catch(e) {
  process.exit( !console.error( "Please copy options.example.js to "+ options_file+': '+e ))
}
seneca.use('options',options_file)
var db = seneca.export('options').db

// for more seneca db stores visit
// https://github.com/search?q=seneca+store
if (db === 'mem') {
  // recommended as development db
  // the builtin mem-store plugin provides a throw-away in-process database
  // also enables http://localhost:3333/mem-store/dump so you can debug db contents
  seneca.use('mem-store',{web:{dump:true}})
  console.log('using mem')
}
else if (db === 'mongo') {
  // mongo database is recommended if not developing
  // NOTE: no code changes are required!
  // this is one of the benefits of using the seneca data entity model
  // for more, see http://senecajs.org/data-entities.html
  var util = require('util')
  seneca.use('mongo-store')

  // erase DB:
  // var q = function(){}
  // q.all$ = true
  // seneca.act({role:'entity', cmd:'remove', qent:seneca.make('sys/user'), q:q}, function(err, data){
  //   if (err) throw err
  // seneca.act({role:'entity', cmd:'remove', qent:seneca.make('team'), q:q}, function(err, data){
  //   if (err) throw err
  // seneca.act({role:'entity', cmd:'remove', qent:seneca.make('event'), q:q}, function(err, data){
  //   if (err) throw err

  // }) }) })

  // register the seneca-memcached plugin - this provides access to a cache layer backed by memcached
  seneca.use('memcached-cache')

  // register the seneca-vcache plugin - this provides version-based caching for 
  // data entities over multiple memcached servers, and caches by query in addition to id
  seneca.use('vcache')

  console.log('using mongo')
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

// register your own plugin - the well app business logic!
// in the options, indicate if you're in development mode
// set the fake option, which triggers creation of test users and events if env == 'development'

seneca.use('well',{fake:'development'==env})

// seneca plugins can export objects for external use
// you can access these using the seneca.export method

// get the configuration options
var options = seneca.export('options')

// get the middleware function from the builtin web plugin
var web = seneca.export('web')

// get the simple database-backed session store defined in well.js
var sessionstore = seneca.export('well/session-store')

// load the express module
// this provides the basic web server
var express = require('express')
var session = require('express-session')

// create an express app
var app = express()

// Log requests to console
app.use( function(req,res,next){
  console.log('EXPRESS',new Date().toISOString(), req.method, req.url)
  next()
})

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log('\n!server addr! '+ add + '\n');
})

// setup express
//app.use( require('cookie-parser') )
app.use( require('body-parser').json() )

// you can't use a single node in-memory session store if you want to scale
// well.js defines a session store that uses seneca entities
app.use( session({ secret: 'CHANGE-THIS', store: sessionstore(session) }) )

// add in the seneca middleware
// this is how seneca integrates with express (or any connect-style web server module)
app.use( web )

// serve static files from a folder defined in your options file
app.use( express.static(__dirname+options.main.public) )  

// start listening for HTTP requests
app.listen( options.main.port )

seneca.log.info('listen',options.main.port)

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
"use strict"

var fs = require('fs')

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
  fs.statSync( options_file )
}
catch(e) {
  process.exit( !console.error( "Please copy options.example.js to "+ options_file+': '+e ))
}
seneca.use('options',options_file)

// db is set in run arguments (e.g. node app.js --env=development --db=mongo-store)
// for more seneca db stores visit
// https://github.com/search?q=seneca+store
var db = argv.db ? argv.db : process.env.db

var custom_dbs = ['mem-store', 'jsonfile-store'] // for dbs using seneca-transport

// if db is unspecified or default
if (custom_dbs.indexOf(db) === -1) {
  if (!db) db = 'mem-store'
  var db_args
  // mem-store is recommended as development db
  // the built in mem-store plugin provides a throw-away in-process database
  // also enables http://localhost:3333/mem-store/dump so you can debug db contents
  if (db === 'mem-store') db_args = {web:{dump:true}}

  // mongo-store is recommended as production db
  // NOTE: no code changes are required! just feed '--db=mongo-store' into the app
  // this is one of the benefits of using the seneca data entity model
  // for more, see http://senecajs.org/data-entities.html

  // init plugin for chosen db
  seneca.use(db, db_args)
  ready()
}
else
{
  // db has been configured so that it saves host information into a file
  // app reads it and connects to the db through seneca-transport
  var metafile = 'db.meta.json'
  var metapath = 'meta/' // for docker
  if (!fs.existsSync(metapath)) metapath = 'node_modules/seneca-db-test-harness/meta/' // for localhost

  var db_info = JSON.parse(fs.readFileSync(metapath + metafile))
  console.log('\nusing ' + db)
  console.log('db address: ' + db_info.ip + ':' + db_info.port + '\n')

  // NOTE: pins are used to expose actions
  // in case of db we are interested in entity oriented actions
  seneca
  .client({host:db_info.ip, port:db_info.port, pins:['role:entity, cmd:*',  'cmd:ensure_entity',  'cmd:define_sys_entity']})
  .ready(function(){

    seneca = this
    ready()
  })
}

// used to clear the db
function erase(entity, callback){
  seneca.act({role:'entity', cmd:'remove', qent:seneca.make(entity), q:{all$ : true}}, function(err, data){
    if (err) seneca.error(err)
      callback(err)
  })
}

function ready(){
// allow to erase DB if --env=clear:
if ('clear' === env)
erase('sys/user', function() {
  erase('team', function() {
    erase('event', function() {
      console.log('db is empty now')

      seneca.use('user')
      seneca.use('well',{fake:'development'==env})

      console.log('db is rebuilt now')
      process.exit(0)
    })
  })
})

// register the seneca-user plugin - this provides user account business logic
seneca.use('user')

// register the seneca-auth plugin - this provides authentication business logic
seneca.use('auth')

// register the seneca-perm plugin - this provides permission checking
// set the entity option to true, which means, "check all entities"
seneca.use('perm',{entity:true})

seneca.use('well',{fake:'development'==env})
// seneca.make$('sys/user').list$()

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

// write server address to output file to allow for automated testing
require('dns').lookup(require('os').hostname(), function (err, add) {
  var full_addr = 'http://' + add + ':' + options.main.port
  fs.writeFile("test/addr.out", full_addr, function(err) {
    if(err) console.error(err)
    console.log('\nserver address: '+ full_addr + '\n')
  })
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

}
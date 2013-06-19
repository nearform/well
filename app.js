"use strict";


// use the optimist module for command line parsing
var argv = require('optimist').argv
var dev = argv.dev


// load the express module
var express = require('express')


// load the seneca module and create a new instance
var seneca  = require('seneca')()

// register the seneca options plugin, and load the options from a local file
var options = seneca.use('options','options.mine.js')

// if not developing, use a mongo database
if( !dev ) {
  seneca.use('mongo-store')
}
else {
  seneca.use('mem-store',{web:{dump:true}})
}


// register the seneca-user plugin - this provides user account business logic
seneca.use('user')

// register the seneca-auth plugin - this provides authentication business logic
seneca.use('auth')

// register the seneca-perm plugin - this provides permission checking
seneca.use('perm',{entity:[{}]})


// register the seneca-data-editor plugin - this provides a user interface for data admin
seneca.use('data-editor')


// register yur own plugin - the well app business logic!
// in the options, indicate if you're in development mode
seneca.use('well',{dev:dev})



// wait for all the seneca plugins to initialize
seneca.ready( function(err) {
  if( err ) return console.log(err);

  // create an express app
  var app = express()

  
  // set up fake users and events for development testing
  if( dev ) {
    seneca.act('role:well,dev:fakeusers',options.well.dev_setup.users,function(err){
      if( err ) return register(err)

      seneca.act('role:well,dev:fakeevents',{events:options.well.dev_setup.events},function(err){
        if( err ) return register(err)
      })
    })
  }

  // setup express
  app.use( express.cookieParser() )
  app.use( express.query() )
  app.use( express.bodyParser() )
  app.use( express.methodOverride() )
  app.use( express.json() )
  app.use( express.session({ secret: 'waterford' }) )

  // add in the seneca middleware
  app.use( seneca.service() )

  // serve static files from a config defined folder
  app.use( express.static(__dirname+options.main.public) )  

  // start listening for HTTP requests
  app.listen( options.main.port )
})



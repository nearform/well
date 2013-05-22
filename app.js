"use strict";


// use the optimist module for command line parsing
var argv = require('optimist').argv
var dev = argv.dev


// load the express module
var express = require('express')


// load the seneca module and create a new instance
var seneca  = require('seneca')()

// register the seneca config plugin, and load the config from a local file
seneca.use('config',{object:require('./config.mine.js')})


// if not developing, use a mongo database
if( !dev ) {
  seneca.use('mongo-store')
}


// register the user plugin - this provides user account business logic
seneca.use('user')

// register the auth plugin - this provides authentication business logic
seneca.use('auth')


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
    seneca.act('role:config,cmd:get,base:well', function(err,well){
      seneca.act('role:well,dev:fakeusers',well.dev_setup.users,function(err){
        if( err ) return register(err)

        seneca.act('role:well,dev:fakeevents',{events:well.dev_setup.events},function(err){
          if( err ) return register(err)
        })
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
  seneca.act('role:config,cmd:get,base:main', function(err,main){
    app.use( express.static(__dirname+main.public) )  

    // start listening for HTTP requests
    app.listen( main.port )
  })
})



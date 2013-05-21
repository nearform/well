"use strict";

var dev = '--dev' == process.argv[2]


var express = require('express')
var seneca  = require('seneca')()

seneca.use('config',{object:require('./config.mine.js')})

if( !dev ) {
  seneca.use('mongo-store')
}

seneca.use('user')
seneca.use('auth')
seneca.use('well',{dev:dev})


seneca.ready( function(err) {
  if( err ) return console.log(err);


  var app = express()


  app.use( function(req,res,next){
    var host = req.headers.host
    if( 'vilniusjs.nearform.com' == host ) {
      res.redirect('http://well.nearform.com/well/vilniusjs-201305/')
    }
    else if( 'copenhagenjs.nearform.com' == host ) {
      res.redirect('http://well.nearform.com/well/copenhagenjs-201305/')
    }
    else next();
  })


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


  app.use( express.cookieParser() )
  app.use( express.query() )
  app.use( express.bodyParser() )
  app.use( express.methodOverride() )
  app.use( express.json() )
  app.use( express.session({ secret: 'waterford' }) )

  app.use( seneca.service() )

  seneca.act('role:config,cmd:get,base:main', function(err,main){
    app.use( express.static(__dirname+main.public) )  

    app.listen( main.port )
  })
})



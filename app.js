"use strict";

var config  = require('./config.mine.js')

var express = require('express')
var seneca  = require('seneca')()



seneca.use('mongo-store',config.mongo)

seneca.use('user')
seneca.use('auth',config.auth)
seneca.use('./well',{numteams:4})



seneca.ready( function(err) {
  if( err ) return console.log(err);

  var w = seneca.pin({role:'well',cmd:'*'})
  w.createevent({name:'NodeJSDublin-Apr-2013'},function(out,event){

    function injectevent( args, done ) {
      args.event = event
      this.parent(args,done)
    }

    seneca.add({role:'well',cmd:'whoami'},injectevent)
    seneca.add({role:'well',cmd:'well'},injectevent)
    seneca.add({role:'well',cmd:'member'},injectevent)
    seneca.add({role:'well',cmd:'leader'},injectevent)
  })


  var app = express()

  app.use( express.cookieParser() )
  app.use( express.query() )
  app.use( express.bodyParser() )
  app.use( express.methodOverride() )
  app.use( express.json() )
  app.use( express.session({ secret: 'nodejsdublin' }) )

  app.use( seneca.service() )

  app.use( express.static(__dirname+config.sencha.public) )  

  app.listen(3333)

})



"use strict";


var argv = require('optimist').argv
var dev = argv.dev

var name = argv.name
var code = argv.code
var numteams = argv.numteams



var seneca  = require('seneca')()
seneca.use('config',{object:require('./config.mine.js')})


// if not developing, use a mongo database
if( !dev ) {
  seneca.use('mongo-store')
}


seneca.use('well',{dev:dev})


seneca.ready( function(err) {

  if( err ) return console.log(err);
  seneca.act('role:well,cmd:createevent', {name:name,code:code,numteams:numteams}, function(err,out){
    console.log(err||'')
    console.dir(out)
    seneca.close()
  })
})



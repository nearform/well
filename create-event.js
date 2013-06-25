/* Simple script create events:
 * node create-event.js --name Foo --code foo --numteams 4
 */

"use strict";



var argv = require('optimist').argv
var env = process.env['NODE_ENV'] || argv.env

var name     = argv.name
var code      = argv.code
var numteams = argv.numteams


var seneca  = require('seneca')()
seneca.use('options','options.well.js')
seneca.use('mongo-store')
seneca.use('user')
seneca.use('well',{env:env})


seneca.ready( function(err) {
  if( err ) return console.log(err);

  seneca.act('role:well,cmd:createevent', {name:name,code:code,numteams:numteams}, function(err,out){
    console.log(err||'')
    console.dir(out)
    seneca.close()
  })
})



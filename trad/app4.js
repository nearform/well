"use strict";


var express = require('express')
var mongodb = require('mongodb')


var app = express()

app.use( express.cookieParser() )
app.use( express.query() )
app.use( express.bodyParser() )
app.use( express.methodOverride() )
app.use( express.json() )
app.use( express.session({ secret: 'waterford' }) )


app.engine('ejs',require('ejs-locals'))
app.set('views', __dirname + '/views')
app.set('view engine','ejs')


var foo_coll

var db = new mongodb.Db('trad', new mongodb.Server("127.0.0.1", 27017))
db.open( function( err) {
  if( err ) return console.log(err);

  db.collection('foo', function(err, coll) {
    if( err ) return console.log(err);

    foo_coll = coll
    app.listen( 3000 )
  })
})


app.get('/', function(req, res, next){
  foo_coll.find().toArray(function(err,out) {
    if( err ) return next(err);

    res.render('index.ejs',{locals:{foo:JSON.stringify(out)}})
  })
})





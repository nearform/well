"use strict";


var express = require('express')


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

app.get('/', function(req, res, next){
  res.render('index.ejs',{locals:{foo:'bar'}})
})


app.listen( 3000 )



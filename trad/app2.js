"use strict";


var express = require('express')


var app = express()

app.use( express.cookieParser() )
app.use( express.query() )
app.use( express.bodyParser() )
app.use( express.methodOverride() )
app.use( express.json() )
app.use( express.session({ secret: 'waterford' }) )


app.get('/foo/:bar',function( req, res, next ){
  res.send( {bar:req.params.bar} )
})

app.use( express.static(__dirname+'/public') )  

app.listen( 3000 )



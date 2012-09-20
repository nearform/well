"use strict";

var express = require('express')
var seneca  = require('seneca')




seneca_init()


function log() {
  console.log( Array.prototype.slice.call(arguments).join('\t') )
}



function seneca_init() {
  var si = seneca()


  si.use( require('seneca-user') )
  si.use( require('seneca-auth') )


  si.ready(function(err,si){
    if( err) return log(err);
    
    express_init(si)
  })
}



function express_init(si) {
  var app = express()

  var viewsfolder = __dirname + '/../views'
  console.log('viewsfolder:'+viewsfolder)

  app.set('views', viewsfolder)
  app.set('view engine', 'ejs')

  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'waterford' }));

  app.use( si.service() )

  app.use(app.router);
  app.use(express.static(__dirname + '/../public'));

  app.get('/', function(req, res){
    console.log(req.seneca)
    res.send('Hello World');
  })

  app.get('/login', function(req, res){
    res.render('login.ejs',{})
  })

  
  app.listen(3333)
}
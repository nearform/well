"use strict";

var express = require('express')
var seneca  = require('seneca')

var su = 
require('eyes').inspect(su)



seneca_init()


function log() {
  console.log( Array.prototype.slice.call(arguments).join('\t') )
}


function seneca_init() {
  seneca(
    {
      require:require,
      plugins:{
        'seneca-user': {
        }
      }
    },
    function(err,si){
      console.log('seneca done: '+err)
      if( err) return log(err);

      express_init(si)
    }
  )
}



function express_init(si) {

  var app = express()

  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'waterford' }));

  app.use( si.service() )

  app.get('/', function(req, res){
    res.send('Hello World');
  })

  
  app.listen(3333)

}
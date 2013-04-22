"use strict";

var express = require('express')
var seneca  = require('seneca')




function log() {
  console.log( Array.prototype.slice.call(arguments).join('\t') )
}



var well_seneca = require('./well-seneca')


well_seneca({},function(err,si){
  if( err ) return log(err);
  express_init(si)
})



function express_init(si) {
  var app = express()

  var viewsfolder = __dirname + '/../views'
  //log('viewsfolder:'+viewsfolder)

  app.set('views', viewsfolder)
  app.set('view engine', 'ejs')

  //app.use(express.logger())
  app.use(express.cookieParser())
  app.use(express.query())
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(express.json())
  //app.use(express.session({ secret: 'waterford' }))


  app.use( si.service( function(http){
    http.get('/foo/:bar/:zoo',function(req,res,next){
      var eyes = require('eyes')
      console.dir(req.params)
      console.log(req.params.bar)
      console.log(req.params[0])
      eyes.inspect(req.params)
      eyes.inspect(req.query)
      eyes.inspect(req.body)
      res.send('done')
    })
  }))

  app.use(app.router)
  app.use(express.static(__dirname + '/../public'))

  app.get('/', function(req, res){
    log(req.seneca)
    res.send('Hello World')
  })

  app.get('/login', function(req, res){
    res.render('login.ejs',{})
  })
  
  app.listen(3333)


  var u = si.pin({role:'user',cmd:'*'})

  // TODO: active by default
  u.register({nick:'u1',name:'nu1',password:'u1',active:true})
  u.register({nick:'u2',name:'nu2',password:'u2',active:true})
  u.register({nick:'u3',name:'nu3',password:'u3',active:true})
  u.register({nick:'u4',name:'nu4',password:'u4',active:false})

  var w = si.pin({role:'well',cmd:'*'})
  w.createevent({name:'foo'})


}
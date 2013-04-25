"use strict";

var config  = require('./config.mine.js')

var express = require('express')
var seneca  = require('seneca')()


seneca.use('user')
seneca.use('auth',config.auth)
seneca.use('./well',{numteams:2})



var u = seneca.pin({role:'user',cmd:'*'})
u.register({nick:'u1',name:'nu1',password:'u1'})
u.register({nick:'u2',name:'nu2',password:'u2'})
u.register({nick:'u3',name:'nu3',password:'u3'})
u.register({nick:'u4',name:'nu4',password:'u4'})
u.register({nick:'u5',name:'nu5',password:'u5'})
u.register({nick:'u6',name:'nu6',password:'u6'})
u.register({nick:'u7',name:'nu7',password:'u7'})
u.register({nick:'u8',name:'nu8',password:'u8'})

var w = seneca.pin({role:'well',cmd:'*'})
w.createevent({name:'NodeJSDublin-Apr-2013'},function(out,event){

  seneca.add({role:'well',cmd:'whoami'},function(args,done){
    args.event = event
    this.parent(args,done)
  })

  seneca.add({role:'well',cmd:'well'},function(args,done){
    args.event = event
    this.parent(args,done)
  })

  seneca.add({role:'well',cmd:'member'},function(args,done){
    args.event = event
    this.parent(args,done)
  })

  seneca.add({role:'well',cmd:'leader'},function(args,done){
    args.event = event
    this.parent(args,done)
  })

})



if( !module.parent ) {

  var app = express()

  //app.use( express.logger() )
  app.use( express.cookieParser() )
  app.use( express.query() )
  app.use( express.bodyParser() )
  app.use( express.methodOverride() )
  app.use( express.json() )
  app.use( express.session({ secret: 'waterford' }) )

  app.use( seneca.service() )

  app.use( function(req,res,next){
    if( 0 == req.url.indexOf('/fake') ) {
      var nick = req.url.substring(6)
      seneca.act('role:user,cmd:login,auto:true,nick:'+nick,function(err,out){
        seneca.act('role:auth,cmd:login',{req$:req,res$:res,user:out.user,login:out.login},function(err){
          res.redirect('/#main')
        })
      })
    }
    else next()
  })

  app.use( express.static(__dirname+config.sencha.public) )  

  app.listen(3333)
}


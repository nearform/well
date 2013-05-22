"use strict";

var _ = require('underscore')





module.exports = function( options, register ){
  var seneca = this
  var name = 'well'

  options = seneca.util.deepextend({
    numcards: 52,
    numteams: 4,
  },options)


  var userent
  seneca.act('role:user, cmd:entity, kind:user',function(err, user){
    if( err ) return register(err);
    userent = user
  })

  var teament  = seneca.make('team')
  var eventent = seneca.make('event')



  seneca.add({role:name,cmd:'whoami'},   whoami)
  seneca.add({role:name,cmd:'leader'},   leader)

  seneca.add({role:name,cmd:'members'},  members)
  seneca.add({role:name,cmd:'well'},     well)
  seneca.add({role:name,cmd:'member'},   member)

  seneca.add({role:name,cmd:'createevent'}, createevent)
  seneca.add({role:name,cmd:'joinevent'},   joinevent)


  if( options.dev ) {
    seneca.add( {role:name,dev:'fakeusers'},  fakeusers)
    seneca.add( {role:name,dev:'fakeevents'}, fakeevents)
  }



  seneca.add({role:'user',cmd:'register'}, function register(args,done){
    this.parent(args,function(err,out){
      if( out.exists ) return done(err,out)
      var user = out.user
      user.events = user.events || {}
      user.save$(function(err,user){
        out.user = user
        done(err,out)
      })
    })
  })



  function createevent( args, done ){
    eventent.load$({name:args.name},function(err,event){
      if( err ) return done(err);
      if( event ) {
        return done(null,event)
      }
      else {
        event = eventent.make$(_.extend({
          numcards: args.numcards || options.numcards,
          numteams: args.numteams || options.numteams,
          name:     args.name,
          code:     args.code,
          users:    {}
        },_.omit(args,['role','cmd'])))

        event.save$( function(err, event){
          if( err ) return done(err);

          seneca.util.recurse(
            event.numteams,
            function( index, next ){
              teament
                .make$({
                  num:index, 
                  event:event.id, 
                  name:maketeamname(index,event.numteams), 
                  wells:{},
                  numwells:0,
                  users:{}
                })
                .save$(next)
            },
            function(err){
              done(err,event)
            }
          )
        })
      }
    })
  }




  function joinevent( args, done ){
    var event = args.event
    var user    = args.user
    
    // already joined
    if( event.users[user.nick] ) {
      return done(null,event)
    }

    var card = _.isUndefined(args.card) ? rand( event.numcards ) : args.card
    var tnum = _.isUndefined(args.team) ? rand( event.numteams ) : args.team

    event.users[user.nick] = {t:tnum,c:card}

    event.save$( function(err,event){
      if( err ) return done(err);
      
      user.events = user.events || {}
      user.events[event.id] = {t:tnum,c:card}
      
      user.save$( function(err, user) {
        if( err ) return done(err);
        
        teament.load$({num:tnum,event:event.id},function(err,team){
          if( err ) return done(err);
          if( !team ) return seneca.fail('unknown team: '+tnum+' event:'+event.id,done);
          
          var avatar = user.service ? user.service.twitter.userdata._json.profile_image_url : false 

          team.users[user.nick]={card:card,name:user.name,avatar:avatar}
          team.save$(function(err){
            var out = {card:card,user:user,team:team,event:event}
            done(err,out)
          })
        })
      })
    })
  }




  function members( args, done ){
    var team  = args.team
    var user  = args.user

    var members = []
    _.each(team.users,function(teamuser,nick){
      var connected = team.wells[nick] ? team.wells[nick][user.nick] ? true : false : false
      var out = {nick:nick,name:teamuser.name,well:connected,avatar:teamuser.avatar||false}

      if( nick != user.nick ) {
        members.push( out )
      }
    })
    done(null,{members:members})
  }




  function member( args, done ){
    var other = args.other
    var event = args.event

    var userevent = event.users[other]
    if( !userevent ) {
      return seneca.fail('not in event: '+event.name+' user:'+other,done);
    }

    userent.load$({nick:other},function(err,user){
      if( err ) return done(user);
      if( !user ) return seneca.fail('unknown user: '+other,done);
      
      done(null,{
        nick:user.nick,
        name:user.name,
        avatar: user.service ? user.service.twitter.userdata._json.profile_image_url : false 
      })
    })
  }


  function leader( args, done ){
    var event   = args.event

    teament.list$({event:event.id},function(err,list){
      if( err ) return done(err);

      var teams = []

      _.each(list,function(team){
        teams.push({
          name:team.name,
          score:team.numwells
        })
      })

      done(null,{teams:teams})
    })    
  }




  function whoami( args, done ) {
    var seneca = this
    var user  = args.user
    var event = args.event

    if( user ) {
      if( !user.events[event.id] ) {
        seneca.act('role:well, cmd:joinevent',{user:user,event:event}, finish)
      }
      else {
        teament.load$({event:event.id,num:user.events[event.id].t},function(err,team){
          finish(err,{user:user,team:team,event:event})
        })
      }
    }
    else done(null,{
      event:{
        name:event.name
      }
    })

    function finish(err,data) {
      if(err) return done(err);

      var user = data.user

      data.card   = event.users[user.nick].c
      data.avatar = user.service ? user.service.twitter.userdata._json.profile_image_url : false 

      seneca.act('role:user, cmd:clean',{user:user},function(err,user){
        
        var out = {
          card:data.card,
          avatar:data.avatar,
          user:user,
          team:data.team.data$(),
          event:data.event.data$()
        }

        delete out.team.users
        delete out.event.users

        done(null,out)
      })
    }
  }



  function well(args,done){
    var event   = args.event
    var user    = args.user
    var other   = args.other // other nick
    var card    = args.card

    var usermeta = event.users[user.nick]
    if( !usermeta ) return seneca.fail('unknown user '+user.nick+' in event '+event.id,done)

    teament.load$({event:event.id,num:usermeta.t},function(err,team){
      if( err ) return done(err);

      if( !team ) return seneca.fail('unkown team '+usermeta.t+' for user '+user.nick+' at event '+event.id,done)

      var otherusermeta = event.users[other]
      if( !otherusermeta ) return seneca.fail('unkown user '+other+' at event '+event.id,done)


      if( otherusermeta.t == usermeta.t ) {

        if( card == otherusermeta.c ) {
          team.wells[user.nick] = (team.wells[user.nick] || {})
          team.wells[user.nick][other]     = 1

          team.wells[other]     = (team.wells[other]     || {})
          team.wells[other][user.nick] = 1

          team.numwells++

          team.save$(function(err,team){
            if( err ) return done(err);

            done(null,{team:team})
          })
        }
        else return seneca.fail('Well from user '+user.nick+' to '+other+' fails as card does not match, event '+event.id,done)
      }
      else return seneca.fail('Well from user '+user.nick+' to '+other+' fails as not on same team for event '+event.id,done)
    })
  }



  function fakeusers( args, done ) {
    if( !args.count ) return done();

    var count = args.count || 16
    var nickprefix = args.nickprefix || 'u'
    var nameprefix = args.nameprefix || 'n'
    var passprefix = args.passprefix || 'p'
    for( var i = 0, j = 0; i < count; i++ ) {
      this.act('role:user,cmd:register',{nick:nickprefix+i,name:nameprefix+i,password:passprefix+i}, function(err){
        if( err ) return done(err);
        if( ++j == count ) return done();
      })
    }
  }


  function fakeevents( args, done ) {
    var seneca = this
    var names = _.keys(args.events)
    var count = names.length
    for( var i = 0; i < count; i++ ) {
      var name = names[i]
      var event = args.events[name]
      event.name = name
      seneca.act('role:well,cmd:createevent',event,function(err,event){
        if( err ) return done(err);
        if( i+1 == count ) return done(null);
      })
    }
  }




  this.act({
    role:'util',
    cmd:'ensure_entity',
    pin:{role:'well',cmd:'*'},
    entmap:{
      event:eventent,
      user:userent,
      team:teament,
    }
  })



  

  function preware(req,res,next){
    var seneca = this

    var fakeI
    if( options.dev ) {
      var m = /^\/fake\/(.*?)\/(.*?)$/.exec(req.url)
      if( m ) { 
        var nick  = m[1]
        var event = m[2]

        seneca.act('role:auth,cmd:login,auto:true,nick:'+nick,function(err,out){
          if( err ) return next(err);

          res.redirect('/well/'+event+'/#main')
        })
      }
      else next();
    }
    else next();
  }


  function postware(req,res,next){
    var m = /^\/well\/[^\/]+\/?(.*)?/.exec(req.url)
    req.url = m ? '/'+(m[1]||'') : req.url

    next()
  }



  function setcontext(req,res,args,act,respond) {
    eventent.load$({code:req.params.event},function(err,event){
      if( err ) return respond(err);
      if( !event ) return res.send(404); 

      args.event = event
      args.user = req.seneca.user
      act(args,respond)
    })
  }


  register(null,{
    name:name,
    service:seneca.http({
      prefix:'/well/:event/',
      pin:{role:name,cmd:'*'},
      
      preware:preware,
      
      map:{
        whoami:{GET:setcontext},
        leader:{GET:setcontext},
        
        members: { alias:'player/members/:team',     GET:  setcontext  },
        well:    { alias:'player/well/:other/:card', POST: setcontext },
        member:  { alias:'player/member/:other',     GET:  setcontext  },
      },
      
      postware:postware,
    })
  })

}




// rand int between 0..bound-1
function rand(bound) {
  return Math.floor(bound * Math.abs(Math.random()))
}


var teamnames = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet']

function maketeamname(tnum){
  return teamnames[tnum]
}

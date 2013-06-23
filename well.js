/* This file is PUBLIC DOMAIN. You are free to cut-and-paste to start your own projects, of any kind */
"use strict";


// load some standard modules
var _       = require('underscore') // see http://npmjs.org/m/underscore
var async   = require('async')      // see http://npmjs.org/m/async
var connect = require('connect')    // see http://npmjs.org/m/connect


// define a seneca plugin
// loaded in app.js with seneca.use('well')
// seneca plugins are just a function that adds some actions to the seneca instance
// the options for the plugin are passed as the first argument
module.exports = function( options ) { 


  // plugin functions are called with the seneca instance as the context
  // store a reference so you can the seneca instance later
  var seneca = this


  // the name of the plugin
  // because plugins can be registered more than once (using tags)
  // this string is often used to identify the "role" that the plugin performs
  // (this is just a convention, you are free to create action patterns any way you like)
  var name = 'well'


  // specify the option defaults
  // seneca.util.deepextend is like _.extendm except it can handle sub properties
  options = seneca.util.deepextend({
    numcards: 52,
    numteams: 4,
    teamnames: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet']
  },options)


  // create entity instances to interact with data storage
  // your data collections ("tables") are team and event
  var teament  = seneca.make('team')
  var eventent = seneca.make('event')

  // this is the standard system entity for user, with
  // base:sys, name:user, see http://senecajs.org/data-entities.html
  var userent  = seneca.make('sys/user') 


  // add your actions to seneca by providing an input pattern to match 

  // the init:name action is special - it is invoked for each
  // plugin, in order, after all the plugins are loaded
  // this is a good place to put any initial data storage interactions
  // just make sure you've defined a data store already
  seneca.add({init:name}, init)


  // define the business logic of your app
  // the function definitions are below
  // it's convenient to list all the action patterns in once place
  // this also serves to document them for maintenance coders 
  seneca.add({role:name,cmd:'whoami'}, whoami)
  seneca.add({role:name,cmd:'leader'}, leader)

  seneca.add({role:name,cmd:'members'},  members)
  seneca.add({role:name,cmd:'well'},     well)
  seneca.add({role:name,cmd:'member'},   member)

  seneca.add({role:name,cmd:'createevent'}, createevent)
  seneca.add({role:name,cmd:'joinevent'},   joinevent)


  // only define these actions if in dev mode
  if( 'dev' == options.env ) {
    seneca.add( {role:name,dev:'fakeusers'},  fakeusers)
    seneca.add( {role:name,dev:'fakeevents'}, fakeevents)
  }



  // action implementations
  // each of these is a function that takes two arguments:
  //   args: the input data that matched the action patter
  //   done: a callback to call when action is complete, standard function(err,result) form


  // ACTION: create a new event, or provide existing
  // args:
  //   name: event name
  //   code: event code string (for use in URL)
  //   numteams: number of teams
  //   numcards: number of playing cards
  //
  // result: event
  function createevent( args, done ){

    // load using entity.load$ method, which accepts a set of data fields that have to match
    eventent.load$({name:args.name},function(err,event){

      // if there was a problem, just bail out to calling code
      if( err ) return done(err);

      // found an existing event, so just return it
      if( event ) {
        return done(null,event)
      }

      // you need to create a new event
      else {

        // use the make$ method to create a new event model instance
        // you pass in a plain object containing the data fields you want to create
        // use _.extend to handle default values
        // also accept custom fields by inserting any other properties found in args
        // (except role and cmd, which are just pattern properties)
        event = eventent.make$(_.extend({
          numcards: args.numcards || options.numcards,
          numteams: args.numteams || options.numteams,
          name:     args.name,
          code:     args.code,
          users:    {}
        },_.omit(args,['role','cmd'])))

        // now save the new event
        event.save$( function(err, event){

          // again, if there was a problem, bail to calling code
          if( err ) return done(err);

          // now create a set of teams
          // seneca.util.recurse is a utility function to iterate over an array,
          // performing the worker function in series for each entry
          seneca.util.recurse(

            event.numteams, // as a convenience, iteration from 0..n-1 if this is a number

            function( index, next ){

              // create and save a team
              teament
                .make$({
                  num:index, 
                  event:event.id, 
                  eventcode:event.code,
                  name:options.teamnames[index],
                  wells:{},
                  numwells:0,
                  users:{}
                })
                .save$(next)
            },

            // seneca.util.recurse cleanup function, called when iteration completes
            // provide the event as the action result
            function(err){

              // no need to check for err, just pass it along if it exists
              done(err,event)
            }
          )
        })
      }
    })
  }


  // ACTION: assign a user to an event, and give them a team
  // args:
  //   event: event model
  //   user:  sys/user model
  //   tnum:  team number, optional, else random
  //   cnum:  card number, optional, else random
  //
  // result: meta data object: {card:, user:, team:, event:}
  function joinevent( args, done ){
    var event = args.event
    var user  = args.user
    
    // if the user has already joined the event, provide details
    // the nick property contains the "username" (or equivalent) of the user
    if( event.users[user.nick] ) {
      teament.load$({num:user.events[event.id].t,event:event.id},function(err,team){

        // pass along error, if it exists
        // NOTE: return is *critical* here, as you need to avoid any further code below
        return done(err,{card:user.events[event.id].c,user:user,team:team,event:event})
      })
    }

      
    // get the card and team numbers
    var card = _.isUndefined(args.cnum) ? rand( event.numcards ) : args.cnum
    var tnum = _.isUndefined(args.tnum) ? rand( event.numteams ) : args.tnum

    // record in event model
    event.users[user.nick] = {t:tnum,c:card}

    // update event storage
    event.save$( function(err,event){
      if( err ) return done(err);
      
      // update user model
      user.events = user.events || {}
      user.events[event.id] = {t:tnum,c:card}
      
      // update user storage
      user.save$( function(err, user) {
        if( err ) return done(err);
        
        // load team based on number and event
        teament.load$({num:tnum,event:event.id},function(err,team){
          if( err ) return done(err);

          // can't find the team, so use seneca.fail to generate error result and return
          // this ensures the error gets logged
          if( !team ) return seneca.fail('unknown team: '+tnum+' event:'+event.id,done);
          
          // grad the users avatar URL if defined
          var avatar = user.service ? user.service.twitter.userdata._json.profile_image_url : false 

          // add user details to team, dulicating data already stored above
          // this classic noSQL denormalisation - don't worry about it, it lets you scale! :)
          team.users[user.nick]={card:card,name:user.name,avatar:avatar}

          // and finally update the team storage
          team.save$(function(err){
            done(err,{card:card,user:user,team:team,event:event})
          })
        })
      })
    })
  }


  // ACTION: list the members of a team
  // args:
  //   team:  team model
  //   user:  sys/user model - current user
  //
  // result: meta data object: {members:[{nick:name:,well:,avatar:},...]}
  function members( args, done ){
    var team  = args.team
    var user  = args.user

    var members = []
    _.each(team.users,function(teamuser,nick){

      // is this team member connected to the current user?
      var connected = team.wells[nick] ? team.wells[nick][user.nick] ? true : false : false

      // create meta data description for each member
      var out = {nick:nick,name:teamuser.name,well:connected,avatar:teamuser.avatar||false}

      // don't list current user
      if( nick != user.nick ) {
        members.push( out )
      }
    })
    
    done(null,{members:members})
  }


  // ACTION: load team members details
  // args:
  //   event: event model
  //   other: team members nick
  //
  // result: meta data object: {nick:,name:,avatar}
  function member( args, done ){
    var other = args.other
    var event = args.event

    // confirm other has joined this event
    var userevent = event.users[other]
    if( !userevent ) {
      return seneca.fail('not in event: '+event.name+' user:'+other,done);
    }

    // load other using nick
    // not really necessary to check if in team as this data is common
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


  // ACTION: generate a leaderboard of teams
  // args:
  //   event: event model
  //
  // result: meta data object: {teams:[{name:,score:},...]}
  function leader( args, done ){
    var event   = args.event

    // search for teams by event
    teament.list$({event:event.id},function(err,list){
      if( err ) return done(err);

      var teams = []

      _.each(list,function(team){
        teams.push({
          name:team.name,

          // the score is just the number of users that have connected
          score:team.numwells
        })
      })

      // leaving sorting to the client CPU!
      done(null,{teams:teams})
    })    
  }


  // ACTION: provide client with current user context, if logged in
  // args:
  //   user:  user model
  //   event: event model
  //
  // result: meta data object: {card:,avatar:,user:,team:,event:}
  function whoami( args, done ) {
    var seneca = this

    // Question: how do these args get set in the first place?
    // Answer: see below: the ensure_entity action and also setcontext function
    var user  = args.user
    var event = args.event

    // logged in, so get context data
    if( user ) {
      
      // user has not yet joined event, so do that now
      if( !user.events[event.id] ) {

        // here's where you see your business login in action
        seneca.act('role:well, cmd:joinevent',{user:user,event:event}, finish)
      }

      // already joined, so get data and provide result
      else {
        teament.load$({event:event.id,num:user.events[event.id].t},function(err,team){
          finish(err,{user:user,team:team,event:event})
        })
      }
    }

    // not logged, at least return event details
    else done(null,{
      event:{
        name:event.name
      }
    })


    // common function to finish action, called in both cases above
    // this is the sort of thing you have to do to deal with callback control flow...
    function finish(err,data) {
      if(err) return done(err);

      var user = data.user

      // set some metadata
      data.card   = event.users[user.nick].c
      data.avatar = user.service ? user.service.twitter.userdata._json.profile_image_url : false 

      // this is a utility action provided by the seneca-user plugin
      // it removed security sensitive data from the user, such as the encrypted password field
      seneca.act('role:user, cmd:clean',{user:user},function(err,user){
        
        // create result object
        var out = {
          card:data.card,
          avatar:data.avatar,
          user:user,
          team:data.team.data$(),
          event:data.event.data$()
        }

        // remove this info to prevent cheating!
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
    var users = args.users

    if( !users ) return done();
    if( 0 === users.count ) return done();

    var count = users.count || 16
    var nickprefix = users.nickprefix || 'u'
    var nameprefix = users.nameprefix || 'n'
    var passprefix = users.passprefix || 'p'
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
    for( var i = 0, j = 0; i < count; i++ ) {
      var name = names[i]
      var event = args.events[name]
      event.name = name
      seneca.act('role:well,cmd:createevent',event,function(err,event){
        if( err ) return done(err);
        if( j+1 == count ) return done(null);
        j++
      })
    }
  }



  function init( args, done ) {
    async.series([
      seneca.next_act('role:util, cmd:define_sys_entity', {list:['-/-/team','-/-/event']}),
      seneca.next_act({role:'user',cmd:'register',nick:'admin',name:'admin',pass:options.admin.pass,admin:true}),

      // set up fake users and events for development testing
      seneca.next_act(_.extend({role:name,dev:'fakeusers',default$:{},users:options.dev_setup.users})),
      seneca.next_act(_.extend({role:name,dev:'fakeevents',default$:{},events:options.dev_setup.events})),

    ], done)
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



  seneca.act({
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
    if( 'dev' == options.env ) {
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



  
  return {
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
  }

}




// rand int between 0..bound-1
function rand(bound) {
  return Math.floor(bound * Math.abs(Math.random()))
}


/*
var teamnames = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet']

function maketeamname(tnum){
  return teamnames[tnum]
}
*/



// it's easy to make your own express session store
module.exports.makestore = function(seneca) {
  var sess_ent = seneca.make$('session')
  function WellStore() {
    var self = new connect.session.Store(this)
    self.get = function(sid, cb) {
      sess_ent.load$({sid:sid},function(err,sess){
        cb(err,sess&&sess.data)
      })
    }
    self.set = function(sid, data, cb) {
      sess_ent.load$({sid:sid},function(err,sess){
        if(err) return cb(err);
        sess = sess||sess_ent.make$({sid:sid})
        sess.data = data
        sess.save$(cb)
      })

    }
    self.destroy = function(sid, cb) {
      sess_ent.remove$({sid:sid},cb)
    }
    return self
  }
  return new WellStore()
}

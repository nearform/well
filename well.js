/* This file is PUBLIC DOMAIN. You are free to cut-and-paste to start your own projects, of any kind */
"use strict";


// load system modules
var util = require('util')

// load utility modules
var _     = require('lodash')  // see http://npmjs.org/package/lodash
var async = require('async')   // see http://npmjs.org/package/async


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
  if( options.fake ) {
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


  // ACTION: connect one user to another in the same team and event - a "Well!"
  // args:
  //   user:  user model
  //   event: event model
  //   other: team members nick
  //   cnum:  card number of other - has to be right!
  //
  // result: meta data object: {card:,avatar:,user:,team:,event:}
  function well(args,done){
    var event   = args.event
    var user    = args.user
    var other   = args.other // other nick
    var card    = args.card

    // get current user's team number
    var usermeta = event.users[user.nick]
    if( !usermeta ) return seneca.fail('unknown user '+user.nick+' in event '+event.id,done)

    // load team
    teament.load$({event:event.id,num:usermeta.t},function(err,team){
      if( err ) return done(err);

      if( !team ) return seneca.fail('unkown team '+usermeta.t+' for user '+user.nick+' at event '+event.id,done)

      // get other user's team
      var otherusermeta = event.users[other]
      if( !otherusermeta ) return seneca.fail('unkown user '+other+' at event '+event.id,done)

      // both need to be on same team
      if( otherusermeta.t == usermeta.t ) {

        // and the card needs to match
        if( card == otherusermeta.c ) {

          // add connection on both sides
          // no need for a many-to-many join table :)
          team.wells[user.nick] = (team.wells[user.nick] || {})
          team.wells[user.nick][other]     = 1

          team.wells[other]     = (team.wells[other]     || {})
          team.wells[other][user.nick] = 1

          // increment team score
          team.numwells++

          team.save$(function(err,team){
            done(err,{team:team})
          })
        }
        else return seneca.fail('Well from user '+user.nick+' to '+other+' fails as card does not match, event '+event.id,done)
      }
      else return seneca.fail('Well from user '+user.nick+' to '+other+' fails as not on same team for event '+event.id,done)
    })
  }


  // ACTION: create some fake users, for testing
  // args:
  //   users:  number to create
  //   {nick,name,pass}prefix: custom prefixes for generated values
  //
  // result: no value
  function fakeusers( args, done ) {
    var users = args.users

    if( !users ) return done();
    if( 0 === users.count ) return done();

    var count = users.count || 16
    var nickprefix = users.nickprefix || 'u'
    var nameprefix = users.nameprefix || 'n'
    var passprefix = users.passprefix || 'p'

    // we can use for loop here, as it does not matter if we hit the in-memory database hard
    for( var i = 0, j = 0; i < count; i++ ) {

      // use the cmd:register action of the seneca-user plugin to register the fake users
      // this ensures they are created properly
      this.act('role:user,cmd:register',{nick:nickprefix+i,name:nameprefix+i,password:passprefix+i}, function(err){
        if( err ) return done(err);
        if( ++j == count ) return done();
      })
    }
  }


  // ACTION: create some fake events, for testing
  // args:
  //   events:  list of names
  //
  // result: no value
  function fakeevents( args, done ) {
    var seneca = this
    var names = _.keys(args.events)
    var count = names.length
    for( var i = 0, j = 0; i < count; i++ ) {
      var name = names[i]
      var event = args.events[name]
      event.name = name

      // use the createvent action defined above
      seneca.act('role:well,cmd:createevent',event,function(err,event){
        if( err ) return done(err);
        if( j+1 == count ) return done();
        j++
      })
    }
  }


  // ACTION: initialize plugin
  // args: none
  //
  // result: no value
  function init( args, done ) {

    // define entities for the data-editor plugin
    // this will allow you to use the visual data editor to manage the data in your app
    // the entities are defined using the canonical form <zone>/<base>/<name>, with - meaning undefined
    // in this case, we're not sharing a database, so we just use simple names: team and event
    seneca.act('role:util, cmd:define_sys_entity', {list:['-/-/team','-/-/event']})

          // register an admin user so that you can login to the data-editor
          .act('role:user, cmd:register',{nick:'admin',name:'admin',password:options.admin.pass,admin:true})
          
          // set up fake users and events for development testing
          // these actions are only defined if in dev mode, so the default$ meta argument 
          // specifies a default result if they can't be found
          .act(_.extend({role:name,dev:'fakeusers',default$:{},users:options.dev_setup.users}))
          .act(_.extend({role:name,dev:'fakeevents',default$:{},events:options.dev_setup.events}), done)
  }


  // ACTION OVERRIDE: add some custom logic to the seneca-user registration process
  // In this case, you need to add an events property, which the other actions expect to find
  seneca.add({role:'user',cmd:'register'}, function(args,done){

    // the this variable references the current seneca instance
    // the prior function references the previously added action matching this pattern
    // the effect is that the standard seneca-user action executes, then you get a chance
    this.prior(args,function(err,out){

      // existing user, so do nothing
      if( !out.ok ) return done(err,out);

      // add events property, and save
      var user = out.user
      user.events = user.events || {}
      user.save$(function(err,user){
        out.user = user
        done(err,out)
      })
    })
  })


  // Remember the question in the whoami function? How are the user and event args set? This is part of the answer.
  // As a convention, Seneca actions expect to get full model objects as arguments - this makes
  // your life much easier as you don't need to go find them in the database, cluttering up your
  // code with load$ calls
  // However, sometimes you'll need to specify entities using their identifier string, because 
  // that's all you have, so that's a catch 22, right?
  // The solution is to wrap the actions (so that they become priors) with lookup actions
  // It would be tedious to write this code all the time, so the builtin util plugin provides an
  // action that does it for you: cmd:ensure_entity
  seneca.act({
    role:'util',
    cmd:'ensure_entity',

    // specify the action patterns you want to wrap using a 'pin', which is a template
    // action pattern. Use '*' to match any value.
    // in this case, actions like role:well,cmd:whoami will be wrapped
    pin:{role:'well',cmd:'*'},

    // look for these arguments, interpret them as entity identifiers, and load them using the given entity 
    entmap:{
      event:eventent,
      user:userent,
      team:teament,
    }
  })



  // This is the other part of the solution to the problem of resolving the user and event
  // this function is used by the web service API of this plugin to find the user and event
  // from the request context
  // The parameters to this function are provided by the seneca.http utility - see below for more details
  function setcontext(req,res,args,act,respond) {
    // the event parameter is not the event id, it's the code - this makes the URL nice
    eventent.load$({code:req.params.event},function(err,event){
      if( err ) return respond(err);

      // send back a HTTP 404 if the event does not exist - it's important to be well behaved
      if( !event ) return res.send(404); 

      args.event = event

      // the user is provided for you by the seneca-auth plugin,
      // which sets up the req.seneca context object for each request
      args.user = req.seneca.user

      // call the business logic function
      act(args,respond)
    })
  }


  
  // This is a HTTP middleware function that is executed before any business logic actions
  // use this to provide custom behavior
  function startware(req,res,next){
    var seneca = this

    // ensure we start on correct route: /well/<event-code>/#main
    if( req.url.match( /^\/well\/[^\/#]+$/) ) {
      res.redirect(req.url+'/#main')
      return
    }
    

    // provide a special url format for fake logins, for testing
    // e.g. http://localhost:port/fake/u1/ma means login user 'u1' into event with code 'ma'
    var fakeI
    if( options.fake ) {
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


  // This is a HTTP middleware function that is executed after the business logic
  function endware(req,res,next){

    // perform some URL rewriting so that static assets can be found independently of the current event
    var m = /^\/well\/[^\/]+\/?(.*)?/.exec(req.url)
    req.url = m ? '/'+(m[1]||'') : req.url

    next()
  }




  // To expose your actions to the outside world over HTTP you can,
  // optionally, provide a 'service' middleware function You do this
  // by calling the role:web action with a use argument. The use
  // argument can be a plain middleware function, and you can do
  // anything you like in it.  

  // However, when there is a relatively direct mapping from your
  // business logic to your HTTP API (which often makes sense), then
  // you can provide a configuration object that defines the routes
  // for your actions.

  // You can use the following properties:
  // name: the name of your plugin
  // prefix: the shared URL prefix; you can use express route syntax
  //         i.e. :param to grad params from the URL pin: the actions that can
  //         be called - with URL format: /prefix/pin_name -
  //         e.g. /well/<event>/whoami 
  // startware, endware: functions as above
  // map: only those actions appearing in the map can actually be
  //      called, so use this to expose only the parts you want to each map
  //      entry specifies the HTTP method to respond to, like so: GET:true,
  //      POST:true, etc URL parameters, query strings, and request bodies
  //      are all merged into a single sets of arguments for the action You
  //      can also provide custom behaviour, as here, by specifying a
  //      function - e.g. setcontext For more, see:
  //      http://senecajs.org/http-mapping.html

  seneca.act({role:'web',use:{
    name:name,
    prefix:'/well/:event/',
    pin:{role:name,cmd:'*'},
      
    startware:startware,
      
    map:{
      whoami:{GET:setcontext},
      leader:{GET:setcontext},
      
      members: { alias:'player/members/:team',     GET:  setcontext  },
      well:    { alias:'player/well/:other/:card', POST: setcontext },
      member:  { alias:'player/member/:other',     GET:  setcontext  },
    },
      
    endware:endware,
  }})



  // express needs a scalable session store if you want to deploy to more than one machine
  // this is simple implementation using seneca entities
  function session_store(session) {

    function WellStore() {
      var self = this;

      session.Store.call(this, {});

      var sess_ent = seneca.make$('session')

      self.get = function(sid, cb) {
        sess_ent.load$(sid,function(err,sess){
          cb(err,sess&&sess.data)
        })
      }

      self.set = function(sid, data, cb) {
        sess_ent.load$(sid,function(err,sess){
          if(err) return cb(err);
          sess = sess||sess_ent.make$({id$:sid})
          sess.last = new Date().getTime()
          sess.data = data
          sess.save$(cb)
        })
      }

      self.destroy = function(sid, cb) {
        sess_ent.remove$(sid,cb)
      }
    }
    util.inherits(WellStore,session.Store)

    return new WellStore()
  }

  // to finish the registration of a plugin, you need to return a meta data obect that
  // defines the name of the plugin, and it's tag value (if any, used if there is more than one instance of the same plugin)
  // here, you also define an express session store
  // Just a reminder: plugin definition is synchronous - that's why you return this object
  return { 
    name:name, 
    exportmap:{
      // this object can be accessed using seneca.export('well/session-store')
      'session-store':session_store
    }
  }
}




// rand int between 0..bound-1
function rand(bound) {
  return Math.floor(bound * Math.abs(Math.random()))
}


// ADD COPYRIGHT INFO OR A DISCLAIMER
"use strict";
process.setMaxListeners(0)

var assert = require('assert')
var util   = require('util')
var Hippie = require('hippie')
var _      = require('lodash')
var async  = require('async')

// Storing login credentials for optimization
var creds = {}
// Storing event-user relationships for optimization
var joined = {}

var base = 'http://localhost:3333'

// Links

// '/auth/change_password'
// '/auth/confirm'
// '/auth/create_reset'
// '/auth/execute_reset'
// '/auth/instance'
// '/auth/load_reset'
// '/auth/register'
// '/auth/update_user'

// Covered:

// '/mem-store/dump'
// '/well/:event/leader'
// '/well/:event/player/members/:team'
// '/well/:event/player/member/:other'
// '/well/:event/player/well/:other/:card'
// '/data-editor/rest/:kind/:id'
// '/well/:event/whoami'

describe('acceptance testing', function(){

  it('mem-store/dump', function(done) {
    ;auth_get({url:'/mem-store/dump', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)
      assert.equal(JSON.parse(res.body).sys.entity !== undefined, true)
      assert.equal(JSON.parse(res.body).sys.user !== undefined, true)
      assert.equal(JSON.parse(res.body).sys.login !== undefined, true)
      done()
    })
  })

  it('well/:event/leader', function(done) {
    ;auth_get({url:'/well/ma/leader', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)
    assert.equal(JSON.parse(res.body).teams.length, 1)

    ;auth_get({url:'/well/mb/leader', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)
    assert.equal(JSON.parse(res.body).teams.length, 2)

    ;auth_get({url:'/well/mc/leader', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)
      assert.equal(JSON.parse(res.body).teams.length, 4)

      done()
    }) }) })
  })

  it('well/:event/player/members/:team', function(done) {
    // Get all users
    ;auth_get({url:'/data-editor/rest/sys%2Fuser', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)

        var users = JSON.parse(res.body).list
        _.each(users, function(user){

        // Add all users to event C with 4 teams
        var auth = user.nick === 'admin' ? 'admin' : 'p' + user.nick.slice(1)
        join({event:'mc', login:user.nick, password:auth}, function(err){
          if (err) return done(err)

          if (users.indexOf(user) < users.length - 1) return

    // Get all teams' ids
    ;auth_get({url:'/data-editor/rest/team', status:200, type:'json'}, function(err, res){
      if (err) return done(err)
        var teams = JSON.parse(res.body).list
        teams = teams.filter(function(team){
          return team.eventcode === 'mc'
        })

        // Add up all users in event's teams returned by (..)/members/:team
        var users_joined = 0
        _.each(teams, function(team){
          _.each(team.users, function(member){
          users_joined++
        })
          if (teams.indexOf(team) < teams.length - 1) return

          // See if it corresponds to the actual number of users added
          assert.equal(users_joined, 17)
          
          done()
      }) }) }) }) })
  })

  it('well/:event/player/member/:other', function(done){

    // Add two users to event A
    ;join({event:'ma', login:'admin', password:'admin'}, function(err){
      if (err) return done(err)

    ;join({event:'ma', login:'u1', password:'p1'}, function(err){
      if (err) return done(err)

    // Access the url and expect admin object
    ;auth_get({url:'/well/ma/player/member/admin', login:'u1', password:'p1'}, function(err, res){
      if (err) return done(err)

      assert.equal(JSON.parse(res.body).nick, 'admin')
      done(err)
    }) }) })
  })

  it('well/:event/player/well/:other/:card', function(done){
    // Add two users to event A
    ;join({event:'ma'}, function(err){
      if (err) return done(err)
    ;join({event:'ma', login:'u1', password:'p1'}, function(err){
      if (err) return done(err)

    // Get event object
    ;auth_get({url:'/data-editor/rest/event', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)
    var event_ma
    _.each(JSON.parse(res.body).list, function(event){
      if (event.code === 'ma') {
        event_ma = event
        return false
      }
    })

    // Get team object
    ;auth_get({url:'/data-editor/rest/team', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)
    var team_ma
    _.each(JSON.parse(res.body).list, function(team){
      if (team.eventcode === 'ma') {
        team_ma = team
        return false
      }
    })

    // Get card of second user and score a point
    ;auth_get({url:'/well/ma/player/well/u1/' + event_ma.users['u1'].c, status:200, type:'json', post:true}, function(err, res) {
      if (err) return done(err)

      assert.equal(JSON.parse(res.body).team.numwells, team_ma.numwells + 1)
      done()
    }) }) }) }) })
  })

  it('data-editor/rest/sys%2Fuser/', function(done){
    test_entity('sys%2Fuser', done)
  })

  it('data-editor/rest/team/', function(done){
    test_entity('team', done)
  })

  it('data-editor/rest/event/', function(done){
    test_entity('event', done)
  })

  it('well/:event/whoami', function(done) {
    auth_get({url:'/well/ma/whoami', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)

      assert.equal(JSON.parse(res.body).user.nick, 'admin')
      done()
    })
  })

})

// ---
// Utility Functions

function test_entity(entity, callback) {
  auth_get({url:'/data-editor/rest/' + entity, status:200, type:'json'}, function(err, res) {
    if (err) return callback(err)
    
    assert.equal(JSON.parse(res.body).list.length > 0, true);
    callback()
  })
}

// Connect to url and setup login cookies
// By default logs in as admin
// args:
//    url:       url to access
//    login:     
//    password:  
//    session:   (optional)
//    login_key: (optional)
//    force:     true if want to force login
//    post:      true if want to POST
function auth_get(args, callback){
  if (!args.login) args.login = 'admin'
  if (!args.password) args.password = 'admin'

  // Check for prev used creds
  if (!args.force && creds[args.login]) {
      args.session = creds[args.login].session
      args.login_key = creds[args.login].login_key
  }

  // Hippie does not flush its expectations field after use
  // God knows what else it does not flush,
  // so make a new instance in each test case
  var hippie = new Hippie()

  // Using previous login credentials reduces up to 89% overhead
  if (!args.session || !args.login_key)
    login(args.login, args.password, function(err, session, login_key){
      // If not logged in before
      logged_in(err, hippie, session, login_key)
    })
  else {
    // if logged in before
    logged_in(null, hippie, args.session, args.login_key)
  }

  // Inner function
  function logged_in(err, hippie, session, login_key){

    hippie
      .base(base)
      .header('Cookie', 'connect.sid=' + session + '; seneca-login=' + login_key)
      
    if (args.post) hippie.post(args.url)
    else hippie.get(args.url)
    if (args.status) hippie.expectStatus(args.status)
    if (args.type === 'json') hippie.expectHeader('Content-Type', 'application/json')
    if (args.type === 'html') hippie.expectHeader('Content-Type', 'text/html; charset=utf-8')

    if (err) callback(err, hippie, session, login_key)

    hippie
      .end(function(err, res){
          callback(err, res, session, login_key)
      })
  }

}

// Get login info
function login(login, password, callback){

  // Login
  var hippie = new Hippie()

  var url = '/auth/login?username=' + login + '&password=' + password

  hippie
    .base(base)
    .get(url)
    .expectStatus(301)
    .end(function(err, res) {
      if (res.headers.location === '#fail') err = new Error('Invalid login credentials')

      // Get cookies
      var login_key
      var session
      var cookies = res.headers['set-cookie'].toString().split(';')
      _.each(cookies, function(cookie){
        if (cookie.indexOf('seneca-login') > -1) login_key = cookie.split('=')[1]
        if (cookie.indexOf('connect.sid') > -1) session = cookie.split('=')[1]
      })
      // Return cookies and set up creds
      if (login_key) creds[login] = {session:session, login_key:login_key}
      callback(err, session, login_key)

  })
}

// Control event joining for optimization
// By default logs in as admin
// args:
//    event:     event code
//    login:     user login
//    password:  user password
function join(args, callback){
  if (!args.event) callback(new Error('No event specified'))
  if (!args.login) args.login = 'admin'
  var event = joined[args.event]

  // If joined already - return
  if (event && event.members.indexOf(args.login) > -1) return callback()

  args.url = '/well/' + args.event + '/whoami'
  args.status = 200
  args.type = 'json'
  auth_get(args, function(err, res){
    if (err) return callback(err)
    else {
      // Create event members if undefined and push login into it
      if (!event) joined[args.event] = {members:[]}
        event = joined[args.event]
        if (event.members.indexOf(args.login) === -1){
          var members = event.members
          members.push(args.login)
          event = {members:members}
        }
    }

  callback()
  })
}
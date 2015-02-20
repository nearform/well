// ADD COPYRIGHT INFO OR A DISCLAIMER
"use strict";
process.setMaxListeners(0)

var assert = require('assert')
var util   = require('util')
var Hippie = require('hippie')
var _      = require('lodash')
var Helper = require('./acceptance.test.helper.js')
var helper = new Helper()

// Links covered:

// '/auth/instance'                         GET
// '/well/:event/leader'                    GET
// '/well/:event/player/members/:team'      GET
// '/well/:event/player/member/:other'      GET
// '/well/:event/player/well/:other/:card'  POST
// '/well/:event/whoami'                    GET
// '/data-editor/rest/:kind/:id'            GET

describe('acceptance testing', function(){

  it('auth', function(done) {
    helper.auth_get({url:'/auth/instance', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)
      assert.equal(JSON.parse(res.body).user.nick, 'admin')
      assert.equal(JSON.parse(res.body).login.nick, 'admin')

      done()
    })
  })

  it('well/:event/leader', function(done) {
    ;helper.auth_get({url:'/well/ma/leader', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)
    assert.equal(JSON.parse(res.body).teams.length, 1)

    ;helper.auth_get({url:'/well/mb/leader', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)
    assert.equal(JSON.parse(res.body).teams.length, 2)

    ;helper.auth_get({url:'/well/mc/leader', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)
      assert.equal(JSON.parse(res.body).teams.length, 4)

      done()
    }) }) })
  })

  it('well/:event/player/members/:team', function(done) {
    this.timeout(3000)
    // Get all users
    ;helper.auth_get({url:'/data-editor/rest/sys%2Fuser', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)

        var users = JSON.parse(res.body).list

        function recurse_join_all(args, callback)
        {
          if (!args.users) return callback(new Error('no users specified'))
          if (args.users.length === 0) return callback()

          if (!args.event) return callback(new Error('no event specified'))

          var user = args.users[args.users.length - 1]
          var auth = user.nick === 'admin' ? 'admin' : 'p' + user.nick.slice(1)
          helper.join({event:args.event, login:user.nick, password:auth}, function(err){
            if (err) return callback(err)

              args.users.pop()
              recurse_join_all(args, callback)
          })
        }

      // Add all users to event C with 4 teams
      recurse_join_all({event:'mc', users:users}, function(err){
        if (err) return done(err)

    // Get all teams' ids
    ;helper.auth_get({url:'/data-editor/rest/team', status:200, type:'json'}, function(err, res){
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
    }) }) }) })
  })

  it('well/:event/player/member/:other', function(done){

    // Add two users to event A
    ;helper.join({event:'ma', login:'admin', password:'admin'}, function(err){
      if (err) return done(err)

    ;helper.join({event:'ma', login:'u1', password:'p1'}, function(err){
      if (err) return done(err)

    // Access the url and expect admin object
    ;helper.auth_get({url:'/well/ma/player/member/admin', login:'u1', password:'p1'}, function(err, res){
      if (err) return done(err)

      assert.equal(JSON.parse(res.body).nick, 'admin')
      done(err)
    }) }) })
  })

  it('well/:event/player/well/:other/:card', function(done){
    // Add two users to event A
    ;helper.join({event:'ma'}, function(err){
      if (err) return done(err)
    ;helper.join({event:'ma', login:'u1', password:'p1'}, function(err){
      if (err) return done(err)

    // Get event object
    ;helper.auth_get({url:'/data-editor/rest/event', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)
    var event_ma
    _.each(JSON.parse(res.body).list, function(event){
      if (event.code === 'ma') {
        event_ma = event
        return false
      }
    })

    // Get team object
    ;helper.auth_get({url:'/data-editor/rest/team', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)
    var team_ma
    _.each(JSON.parse(res.body).list, function(team){
      if (team.eventcode === 'ma') {
        team_ma = team
        return false
      }
    })

    // Get card of second user and score a point
    ;helper.auth_get({url:'/well/ma/player/well/u1/' + event_ma.users['u1'].c, status:200, type:'json', post:true}, function(err, res) {
      if (err) return done(err)

      assert.equal(JSON.parse(res.body).team.numwells, team_ma.numwells + 1)
      done()
    }) }) }) }) })
  })

  it('well/:event/whoami', function(done) {
    helper.auth_get({url:'/well/ma/whoami', status:200, type:'json'}, function(err, res) {
      if (err) return done(err)

      assert.equal(JSON.parse(res.body).user.nick, 'admin')
      done()
    })
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

})

// ---
// Utility Functions

function test_entity(entity, callback) {
  helper.auth_get({url:'/data-editor/rest/' + entity, status:200, type:'json'}, function(err, res) {
    if (err) return callback(err)
    
    assert.equal(JSON.parse(res.body).list.length > 0, true);
    callback()
  })
}
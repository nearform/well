// ADD COPYRIGHT INFO OR A DISCLAIMER
"use strict";

var Helper = require('./test-helper.js')
var helper = new Helper();
var _      = require('lodash')
var util   = require('util')
var assert = require('assert')
var async  = require('async')

describe('happy', function() {

  // May occasionally throw 'Cannot read property 'name' of undefined'
  // because the app distributes users randomly
  // without balancing the amount on both teams.
  it('happy main', function(done) {
    helper.init(function(si) {

      // Load event A from db
      ;si
        .make$('event')
        .load$({code:'ma'}, function(err, event){
      // Load users from db
      ;si
        .make$('sys/user')
        .list$(function(err, users){
      // Insert all users into event A
      _.each(users, function(user) {

      ;si
        .act('role:well, cmd:joinevent', {
          user: user,
          event: event
        }, function(err, res) {
          if (users.indexOf(user) < users.length - 1) return // <-- Loop control
      // Load team 0 from event A
      ;si
        .make$('team')
        .load$({event:event.id, num:0}, function(err, team){
        // load all members of team 0
        var members = []
          _.each(team.users, function(user, nick) {
            members.push(user)
        })
      // Load member 0
      ;si
        .make$('sys/user')
        .load$({
          name: members[0].name
        }, function(err, member_zero) {
      // Load member 1
      ;si
      .make$('sys/user')
      .load$({
        name: members[1].name
      }, function(err, member_one) {
      // Make the members exchange a card
      ;si
        .act('role:well, cmd:well', {
          user: member_zero,
          event: event,
          other: member_one.nick,
          card: event.users[member_one.nick].c
        }, function(err, res){
          // Check if the points were added
          assert.equal(res.team.numwells, 1)

          done()
      }) }) }) }) }) }) }) })
    })
  })
})

describe('data structure integrity', function() {

  it('cmd:whoami logged out', function(done) {
    helper.init(function(si){

      // Load event A from DB
      ;si
        .make$('event')
        .load$({code:'ma'},function(err,event){
      // Should return contents of event A
      ;si
        .act('role:well,cmd:whoami',{event:event},function(err,res){
          assert.equal(res.event.name, event.name)
          
          done()
      }) })
    })
  })

  // Currently does not check for the avatar
  it ('cmd:whoami logged in', function(done){
    helper.init(function(si){

      // Load event A from DB
      ;si
        .make$('event')
        .load$({code:'ma'},function(err,event){
      // Load admin from DB
      ;si
        .make('sys/user').load$({nick:'admin'}, function(err, user) {
      // Should return meta data object: {card:,avatar:,user:,team:,event:}
      ;si
        .act('role:well, cmd:whoami', {
          user: user,
          event: event
        }, function(err, res) {
          assert.equal(res.card, user.events[event.id].c)
          assert.equal((user.avatar === undefined && res.avatar === false), true)
          assert.equal(res.user.id, user.id)
          assert.equal(res.team.num, user.events[event.id].t)
          assert.equal(res.event.id, event.id)
            
          done()
      }) }) })
    })
  })

  it('cmd:leader', function(done){
    helper.init(function(si){

      // Load event A from db
      ;si
        .make$('event')
        .load$({code:'ma'}, function(err, event){
      // Get list of teams in event A through cmd:leader
      ;si
        .act('role:well, cmd:leader', {
          event: event
        }, function(err, leader){
      // Get list of teams in event A directly from db
      ;si
        .make$('team')
        .list$({event:event.id}, function(err, dbteams){
          // Format both lists into arrays of names(leader does not contain id data)
          dbteams = dbteams.map(function(element) {
            return element.name
          })
          leader = leader.teams.map(function(element) {
            return element.name
          })
          // Compare team names
          assert.deepEqual(dbteams, leader)
          // Make sure an unwanted element is not contained within the cmd:leader response
          assert.equal(leader.indexOf('Blue'), -1)

          done()
      }) }) })
    })
  })

  it('cmd:members', function(done) {
    helper.seneca(function(seneca, userent, teament, eventent) {
      async.waterfall([
        // Loading event 1 from db
        function(callback) {
          eventent.load$({
            code: 'mb'
          }, callback)
        },
        // Loading users from db
        function(event, callback) {
          userent.list$(function(err, users) {
            callback(err, event, users)
          })
        },
        // Insert all users into event 1
        function(event, users, callback) {
          _.each(users, function(user) {
            seneca.act('role:well, cmd:joinevent', {
              user: user,
              event: event
            }, function(err, res) {
              if (users.indexOf(user) === users.length - 1) callback(err)
            })
          })
        },
        // Loading event 1 from db to refresh data
        function(callback) {
          eventent.load$({
            code: 'mb'
          }, callback)
        },
        // Loading the only team in event 1 from db
        function(event, callback) {
          teament.load$({
            event: event.id,
            num: 0
          }, callback)
        },
        // Loading a known user from that team
        function(team, callback) {
          userent.load$({
            nick: 'admin'
          }, function(err, user) {
            callback(err, team, user)
          })
        },
        // Obtaining members
        function(team, user, callback) {

          seneca.act('role:well, cmd:members', {
            team: team,
            user: user
          }, function(err, members) {
            callback(err, team, members)
          })
        },
        // Comparing db against members return
        function(team, members, callback) {

          // admin is being removed, because it's supplied into members call as the user to be ignored

          // Removing admin from list which is db clone
          // Storing db members in an array
          var dbnames = []
          _.each(team.users, function(teamuser) {
            if (teamuser.name != 'admin') dbnames.push(teamuser.name)
          })

          // Storing returned members in an array
          var memnames = []
          _.each(members.members, function(member) {
            memnames.push(member.name)
          })

          // Making sure does not contain admin
          assert.equal((memnames.indexOf("admin") === -1), true)

          // Making sure db elements are same as returned elements
          assert.deepEqual(dbnames, memnames)

          done()
        }
      ])
    })
  })

  // Currently does not check for the avatar
  it('cmd:member', function(done) {
    helper.seneca(function(seneca, userent, teament, eventent) {
      async.waterfall([
        // Loading event 0 from db
        function(callback) {
          eventent.load$({
            code: 'ma'
          }, callback)
        },
        // Loading admin from db
        function(event, callback) {
          userent.load$({
            nick: 'admin'
          }, function(err, user) {
            callback(err, event, user)
          })
        },
        // Insert admin to event 0
        function(event, user, callback) {
          seneca.act('role:well, cmd:joinevent', {
              user: user,
              event: event
            },
            function(err, res) {
              callback(err, event, user)
            })
        },
        // Should return meta data object: {nick:,name:,avatar}
        function(event, user, callback) {
          seneca.act('role:well, cmd:member', {
            other: user.nick,
            event: event
          }, function(err, res) {
            assert.equal(res.nick, user.nick)
            assert.equal(res.name, user.name)
            assert.equal((user.avatar === undefined && res.avatar === false), true)
            done(err)
          })
        }
      ])
    })
  })

})
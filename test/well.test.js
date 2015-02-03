// ADD COPYRIGHT INFO OR A DISCLAIMER
"use strict";

var Helper = require('./test-helper.js')
var helper = new Helper();
var _ = require('lodash')
var util = require('util')
var assert = require('assert')
var async = require('async')

describe('seneca, role:well', function() {
  it('cmd:leader', function(done) {
    helper.seneca(function(seneca, userent, teament, eventent) {
      async.waterfall([
        // Loading events from db
        function(callback) {
          eventent.list$(callback)
        },
        function(events, callback) {
          // Get list of teams in event 0 through leader cmd
          seneca.act('role:well, cmd:leader', {
            event: events[0]
          }, function(err, leader) {
            callback(err, events, leader)
          })
        },
        function(events, leader, callback) {
          // Get list of teams in event 0 directly from db
          teament.list$({
            event: events[0].id
          }, function(err, dbteams) {

            // Format both lists into arrays of names(leader does not contain id data)
            dbteams = dbteams.map(function(element) {
              return element.name
            })
            leader = leader.teams.map(function(element) {
              return element.name
            })

            // Compare team names
            assert.deepEqual(dbteams, leader)

            // Make sure an unwanted element is not contained within the array
            assert.equal(leader.indexOf('Blue'), -1)
            done(err)
          })
        }
      ])
    })
  })

  it('cmd:members', function(done) {
    helper.seneca(function(seneca, userent, teament, eventent) {
      async.waterfall([
        // Loading events from db
        function(callback) {
          eventent.list$(callback)
        },
        // Loading users from db
        function(events, callback) {
          userent.list$(function(err, users) {
            callback(err, events, users)
          })
        },
        // Insert all users into event 1
        function(events, users, callback) {
          _.each(users, function(user) {
            seneca.act('role:well, cmd:joinevent', {
              user: user,
              event: events[1]
            }, function(err, data) {
              if (users.indexOf(user) === users.length - 1) callback(err)
            })
          })
        },
        // Loading events from db to refresh data
        function(callback) {
          eventent.list$(callback)
        },
        // Loading teams of event B from db
        function(events, callback) {
          teament.list$({
            event: events[1].id
          }, callback)
        },
        // Loading a known user from that team
        function(teams, callback) {
          userent.load$({
            nick: 'admin'
          }, function(err, user) {
            callback(err, teams, user)
          })
        },
        // Obtaining members
        function(teams, user, callback) {

          seneca.act('role:well, cmd:members', {
            team: teams[0],
            user: user
          }, function(err, members) {
            callback(err, teams, members)
          })
        },
        // Comparing db against members return
        function(teams, members, callback) {

          // admin is being removed, because it's supplied into members call as the user to be ignored

          // Removing admin from list which is db clone
          // Storing db members in an array
          var dbnames = []
          _.each(teams[0].users, function(teamuser) {
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

  it('cmd:whoami', function(done) {
    helper.seneca(function(seneca, userent, teament, eventent) {
      // TODO
      done(new Error('TO BE IMPLEMENTED !'))
    })
  })

  it('cmd:well', function(done) {
    helper.seneca(function(seneca, userent, teament, eventent) {
      // TODO
      done(new Error('TO BE IMPLEMENTED !'))
    })
  })

  it('cmd:member', function(done) {
    helper.seneca(function(seneca, userent, teament, eventent) {
      // TODO
      done(new Error('TO BE IMPLEMENTED !'))
    })
  })

  it('cmd:createevent', function(done) {
    helper.seneca(function(seneca, userent, teament, eventent) {
      // TODO
      done(new Error('TO BE IMPLEMENTED !'))
    })
  })

  it('cmd:joinevent', function(done) {
    helper.seneca(function(seneca, userent, teament, eventent) {
      // TODO
      done(new Error('TO BE IMPLEMENTED !'))
    })
  })
})
module.exports =
  function() {

    var async = require('async')
    var _ = require('lodash')

    this.seneca = function(done) {
      var seneca = require('seneca')()

      // Init well.js
      seneca.use('options', '../options.well.js')
      var options = seneca.export('options')
      options.dev_setup = options.well.dev_setup // <- This is not normal, check if app should really work like this

      seneca.use('user')
      seneca.use('../well', options)

      var userent = seneca.make('sys/user')
      var teament = seneca.make('team')
      var eventent = seneca.make('event')

      // Init entities
      async.waterfall([
        // Adding events
        function(callback) {
          eventent.make$(_.extend({
              numcards: 52,
              numteams: 2,
              name: 'MeetupA',
              code: 'ma',
              users: {}
            }, _.omit({
              name: 'MeetupA',
              code: 'ma'
            }, ['role', 'cmd']))).save$()
            .make$(_.extend({
              numcards: 52,
              numteams: 1,
              name: 'MeetupB',
              code: 'mb',
              users: {}
            }, _.omit({
              name: 'MeetupB',
              code: 'mb'
            }, ['role', 'cmd']))).save$(function(err, event) {
              callback(err)
            })
        },
        // Loading events from db
        function(callback) {
          eventent.list$(function(err, events) {
            callback(err, events)
          })
        },
        // Adding teams
        // Add a team to event with index 0
        function(events, callback) {
          teament.make$({
              num: 0,
              event: events[0].id,
              eventcode: events[0].code,
              name: 'Red',
              wells: {},
              numwells: 0,
              users: {}
            }).save$()
            .make$({
              num: 1,
              event: events[0].id,
              eventcode: events[0].code,
              name: 'Tan',
              wells: {},
              numwells: 0,
              users: {}
            }).save$(function(err, entity) {
              callback(err, events)
            })
        },
        // Add a team to a different event
        function(events, callback) {
          teament.make$({
            num: 0,
            event: events[1].id,
            eventcode: events[1].code,
            name: 'Blue',
            wells: {},
            numwells: 0,
            users: {}
          }).save$(function(err, entity) {
            callback(err)
          })
        },
        // Load users, but do not assign them to any events to allow tests for custom setup
        function(callback) {
          // Use the cmd:register action of the seneca-user plugin to register the fake users
          // This ensures they are created properly
          seneca.act('role:user,cmd:register', {
              nick: 'u1',
              name: 'n1',
              password: 'p1'
            })
            .act('role:user,cmd:register', {
              nick: 'u2',
              name: 'n2',
              password: 'p2'
            })
            .act('role:user,cmd:register', {
              nick: 'u3',
              name: 'n3',
              password: 'p3'
            })
            .act('role:user,cmd:register', {
              nick: 'u4',
              name: 'n4',
              password: 'p4'
            }, callback)
        }
      ], function() {
        done(seneca, userent, teament, eventent)
      })
    }

    this.list_all = function list_all(userent, teament, eventent) {
      eventent.list$(function(err, dblist) {
        if (err) return console.error(err)
        console.log("\n\t\t ---")
        console.log("\t\tEvents\n")
        dblist.forEach(function(element) {
          console.log(element + '\n')
        })
        console.log("\n\t\t ---\n");
      })

      teament.list$(function(err, dblist) {
        console.log("\n\t\t ---")
        console.log("\t\tTeams\n")
        if (err) return console.error(err)
        dblist.forEach(function(element) {
          console.log(element + '\n')
        })
        console.log("\n\t\t ---\n")
      })

      userent.list$(function(err, dblist) {
        console.log("\n\t\t ---")
        console.log("\t\tUsers\n")
        if (err) return console.error(err)
        dblist.forEach(function(element) {
          console.log(element + '\n')
        })
        console.log("\n\t\t ---\n")
      })
    }

    this.show_commands = function show_commands(seneca) {
      console.log("\n\t\t---")
      console.log("\tSENECA COMMANDS AVAILABLE:\n")
      seneca.list().forEach(function(element) {
        console.log(element)
      })
      console.log("\n\t\t---\n")
    }

    this.show_routes = function show_routes(seneca) {
      seneca.act('role:web, cmd:routes', function(err, routes) {
        console.log("\n\t\t---")
        console.log("\tSENECA ROUTES AVAILABLE:\n");
        console.log(routes)
        console.log("\n\t\t---\n")
      })
    }
  }
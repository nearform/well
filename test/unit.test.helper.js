module.exports =
  function() {

    var _     = require('lodash')

    this.init = function(done) {
      var si = require('seneca')({
        errhandler: done
      })

      // Init well.js
      si.use('options', '../options.well.js')
      var options = si.export('options')
      options.dev_setup = options.well.dev_setup // <- This is not normal, check if app should really work like this

      si.use('user')
      si.use('../well', options)

      // Add event A
      ;si
        .make$('event')
        .make$(_.extend({
          numcards: 52,
          numteams: 2,
          name: 'MeetupA',
          code: 'ma',
          users: {}
        }, _.omit({
          name: 'MeetupA',
          code: 'ma'
        }, ['role', 'cmd'])))
        .save$(function(err, event_a){

      // Add event B
      ;si
        .make$('event')
        .make$(_.extend({
          numcards: 52,
          numteams: 1,
          name: 'MeetupB',
          code: 'mb',
          users: {}
        }, _.omit({
          name: 'MeetupB',
          code: 'mb'
        }, ['role', 'cmd'])))
        .save$(function(err, event_b){

      // Add team Red to event A
      ;si
        .make$('team')
        .make$({
            num: 0,
            event: event_a.id,
            eventcode: event_a.code,
            name: 'Red',
            wells: {},
            numwells: 0,
            users: {}
          })
        .save$(function(err, team_r){

      // Add team Green to event A
      ;si
        .make$('team')
        .make$({
          num: 1,
          event: event_a.id,
          eventcode: event_a.code,
          name: 'Green',
          wells: {},
          numwells: 0,
          users: {}
        })
        .save$(function(err, team_g) {
        
      // Add team Blue to event B
      ;si
      .make$('team')
      .make$({
        num: 0,
        event: event_b.id,
        eventcode: event_b.code,
        name: 'Blue',
        wells: {},
        numwells: 0,
        users: {}
      })
      .save$(function(err, team_b) {
     
      si.util.recurse(6, function( index, next ){
        si
        .act('role:user,cmd:register', {
            nick: 'u' + index,
            name: 'n' + index,
            password: 'p' + index
          }, next)
      }, function(err, data){
          done(si)
      }) }) }) }) }) })
    }

    this.list_all = function list_all(seneca) {
      seneca.make$('event').list$(function(err, dblist) {
        if (err) return console.error(err)
        console.log("\n\t\t ---")
        console.log("\t\tEvents\n")
        dblist.forEach(function(element) {
          console.log(element + '\n')
        })
        console.log("\n\t\t ---\n");
      })

      seneca.make$('team').list$(function(err, dblist) {
        console.log("\n\t\t ---")
        console.log("\t\tTeams\n")
        if (err) return console.error(err)
        dblist.forEach(function(element) {
          console.log(element + '\n')
        })
        console.log("\n\t\t ---\n")
      })

      seneca.make$('sys/user').list$(function(err, dblist) {
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
  }
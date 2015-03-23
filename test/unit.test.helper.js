// ADD COPYRIGHT INFO OR A DISCLAIMER

var db = process.env['npm_config_db']
var ip = process.env['npm_config_ip']
var port = process.env['npm_config_port']

module.exports =
  function() {

    var _  = require('lodash')
    var fs = require('fs')

    this.init_empty = function(done) {
      var si = require('seneca')({
        errhandler: done,
        default_plugins:{'mem-store':false}
      })

      var util = require('util')

      // get options
      si.use('options', '../options.well.js')
      var options = si.export('options')
      options.dev_setup = options.well.dev_setup // <- this is not normal, check if app should really work like this

      // init and clean db
      if (!db){
        throw new Error('No db specified. try npm test --db=mem-store or any other store')
        process.exit(0)
      }
      if (db === 'postgres-store') db = 'postgresql-store'
      console.log('using ' + db + ' db')

      var db_path = __dirname + '/unit-db/'
      // ensure db folder
      if (!fs.existsSync(db_path)) fs.mkdirSync(db_path)
      db_path += db
      if (!fs.existsSync(db_path)) fs.mkdirSync(db_path)

      // setup db-specific args
      var db_args = {}
      if (db === 'jsonfile-store') db_args = {folder:db_path}

      if (ip && ip !== '' && port && port !== '') {
        db_args.host = ip
        db_args.port = port
      }
      if (db_args.host && db_args.port) console.log('connecting at ' + db_args.host + ':' + db_args.port)
        else console.log('db connection is internal')
      si.use(db, db_args)

      this.clean_db(si, function(err){

        // confirm app has init a store
        // si.act('role:entity, cmd:native', {ent:'entity'}, function(err, res){
        //   if (_.isEmpty(res) && db !== 'mem-store'){
        //     console.error('\nfailed to init ' + db + ' db\n')
        //     process.exit(0)
        //   }

          // init well.js
          si.use('user')
          si.use('../well', options)

          done(si)
        // })
      })
    }

    this.init = function(done) {
      this.init_empty(function(si){

      // add event A
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

      // add event B
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

      // add team Red to event A
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

      // add team Green to event A
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
        
      // add team Blue to event B
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
     
     // add users
      si.util.recurse(6, function( index, next ){
        si
        .act('role:user,cmd:register', {
            nick: 'u' + index,
            name: 'n' + index,
            password: 'p' + index
          }, next)
      }, function(err, data){

          done(si)
      }) }) }) }) }) }) })
    }

    // erases all entities from db
    this.clean_db = function(seneca, cb){
      erase('sys/user', seneca, function() {
        erase('team', seneca, function() {
          erase('event', seneca, function() {
            if ('db' === 'jsonfile-store') seneca.make$('sys', 'entity').save$()
            cb()
          })
        })
      })
    }

    // erase particular entity from db
    function erase(entity, seneca, callback){
      seneca.act({role:'entity', cmd:'remove', qent:seneca.make(entity), q:{all$ : true}}, function(err, data){
        if (err) seneca.error(err)
          callback(err)
      })
    }

    this.list_all = function (seneca) {
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

    this.show_commands = function (seneca) {
      console.log("\n\t\t---")
      console.log("\tSENECA COMMANDS AVAILABLE:\n")
      seneca.list().forEach(function(element) {
        console.log(element)
      })
      console.log("\n\t\t---\n")
    }
  }
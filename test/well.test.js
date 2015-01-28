// TODO:
// - Five more test cases
// - Check dev_setup
// - Can you ever be a member of two teams at the same time?

// ADD COPYRIGHT INFO OR A DISCLAIMER
"use strict";

var _ 		= require('underscore')	// see http://npmjs.org/m/underscore
var util 	= require('util')
var assert 	= require('assert')
var async   = require('async') 		// see http://npmjs.org/m/async
var seneca  = require('seneca')()

// Init well.js
seneca.use('options','../options.well.js')
var options = seneca.export('options')
options.dev_setup = options.well.dev_setup // <- This is not normal, check if app should really work like this

seneca.use('user')
seneca.use('../well',options)

var userent  = seneca.make('sys/user')
var teament  = seneca.make('team')
var eventent  = seneca.make('event')

// Used to create sample data

describe('seneca, role:well', function(){

	beforeEach(function(done){
		async.waterfall([
			// Adding events
			function(callback){
				eventent.make$(_.extend({
					numcards: 52,
					numteams: 2,
					name:     'MeetupA',
					code:     'ma',
					users:    {}
				},_.omit({name:'MeetupA', code:'ma'},['role','cmd']))).save$( function(err, event){
					if( err ) return console.log(err)
					callback()
				})
			},
			function(callback){
				eventent.make$(_.extend({
					numcards: 52,
					numteams: 1,
					name:     'MeetupB',
					code:     'mb',
					users:    {}
				},_.omit({name:'MeetupB', code:'mb'},['role','cmd']))).save$( function(err, event){
					if( err ) return console.log(err);
					callback()
				})
			},
			// Loading events from db
			function(callback){
				eventent.list$(function(err,events){
					if( err ) return console.log(err)
					callback(null, events)
				})
			},
			// Adding teams
			// Add a team to event with index 0
			function(events, callback){
				teament.make$({
			      num:0, 
			      event:events[0].id, 
			      eventcode:events[0].code,
			      name:'Red',
			      wells:{},
			      numwells:0,
			      users:{}
			    }).save$(function(err, entity){
			    	if (err) return console.log(err)
			        callback(null, events)
			    })
			},
			// Add another team to event with index 0
			function(events, callback){
				teament.make$({
			      num:1, 
			      event:events[0].id, 
			      eventcode:events[0].code,
			      name:'Tan',
			      wells:{},
			      numwells:0,
			      users:{}
			    }).save$(function(err, entity){
			    	if (err) return console.log(err)
			    	callback(null, events)
			    })
			},
			// Add a team to a different event
			function(events, callback){
				teament.make$({
			      num:0, 
			      event:events[1].id, 
			      eventcode:events[1].code,
			      name:'Blue',
			      wells:{},
			      numwells:0,
			      users:{}
			    }).save$(function(err, entity){
			    	if (err) return console.log(err)
			    	callback(null, events)
			    })
			},
			// Load users, but do not assign them to any events to allow tests for custom setup
			function(events, callback){
				for( var i = 0, j = 0, count = 4; i < count; i++ ) {
					// Use the cmd:register action of the seneca-user plugin to register the fake users
					// This ensures they are created properly
					seneca.act('role:user,cmd:register',{nick:'u'+i,name:'n'+i,password:'p'+i}, function(err, data){
						if (err) return console.log(err)
						j++
						if (j < count) return

						callback(null, events)
					})
			    }
			},
			// Loading users from db
			function(events, callback){
				userent.list$(function(err,users){
					if( err ) return console.log(err)
					callback(null, events, users)
				})
			}],
           function(err, result) {
				if( err ) return console.log(err)
				done()
           }
		)
	})

	it('cmd:leader', function(done){

		async.waterfall([
			// Loading events from db
			function(callback){
				eventent.list$(function(err,events){
					if( err ) return done(err)
						callback(null, events)
				})
			},
			function(events, callback){
				// Get list of teams in event 0 through leader cmd
				seneca.act('role:well, cmd:leader', {event:events[0]}, function(err, leader){
					callback(null, events, leader)
				})
			},
			function(events, leader, callback){
				// Get list of teams in event 0 directly from db
				teament.list$({event:events[0].id},function(err,dbteams){
					if( err ) return done(err)

					// Format both lists into arrays of names(leader does not contain id data)
					dbteams = dbteams.map(function (element) {
						return element.name
					})
					leader = leader.teams.map(function (element) {
						return element.name
					})

					// Compare team names
					assert.deepEqual(dbteams, leader)

					// Make sure an unwanted element is not contained within the array
					assert.equal(leader.indexOf('Blue'),-1)

					done()
				})
			}
		])
	})

	it ('cmd:members', function(done){
		async.waterfall([
			// Loading events from db
			function(callback){
				eventent.list$(function(err,events){
					if( err ) return done(err)
					callback(null, events)
				})
			},
			// Loading users from db
			function(events, callback){
				userent.list$(function(err,users){
					if( err ) return done(err)
					callback(null, events, users)
				})
			},
			// Insert all users into event 1
			function(events, users, callback){
				for (var i = 0, j = 0; i < users.length; i++){
					seneca.act('role:well, cmd:joinevent', {user:users[i], event:events[1]}, function(err, data){
						if( err ) return console.log(err)
						j++
						if (j < users.length) return
						callback()
					})
				}
			},
			// Loading events from db to refresh data
			function(callback){
				eventent.list$(function(err,events){
					if( err ) return done(err)
					callback(null, events)
				})
			},
			// Loading teams of event B from db
			function(events, callback){
				teament.list$({event:events[1].id},function(err,teams){
					if( err ) return done(err)
					callback(null, teams)
				})
			},
			// Loading users of that team
			function(teams, callback){
				userent.list$({nick:'admin'},function(err,users){
					if( err ) return done(err)
					callback(null, teams, users[0])
				})
			},
			// Obtaining members
			function(teams, user, callback){

				seneca.act('role:well, cmd:members', {team:teams[0], user:user}, function(err, members){
					if (err) return done(err)
					callback(null, teams, members)
				})
			},
			// Comparing db against members return
			function(teams, members, callback){

				// admin is being removed, because it's supplied into members call as the user to be ignored

				// Removing admin from list which is db clone
				// Storing db members in an array
				var dbnames = []
			    _.each(teams[0].users,function(teamuser){
			    	if (teamuser.name != 'admin') dbnames.push(teamuser.name)
			    })

			    // Storing return members in an array
			    var memnames = []
			    _.each(members.members,function(member){
			    	memnames.push(member.name)
			    })

			    // Making sure does not contain admin
			    assert.equal((memnames.indexOf("admin") == -1), true)

			    // Making sure db elements are same as returned elements
			    assert.deepEqual(dbnames, memnames)

				done()
			}
		])
	})

	it ('cmd:whoami', function(done){
		assert.equal('TO BE IMPLEMENTED', 1)
		// TODO
		done()
	})

	it ('cmd:well', function(done){
		assert.equal('TO BE IMPLEMENTED', 1)
		// TODO
		done()
	})

	it ('cmd:member', function(done){
		assert.equal('TO BE IMPLEMENTED', 1)
		// TODO
		done()
	})

	it ('cmd:createevent', function(done){
		assert.equal('TO BE IMPLEMENTED', 1)
		// TODO
		done()
	})

	it ('cmd:joinevent', function(done){
		assert.equal('TO BE IMPLEMENTED', 1)
		// TODO
		done()
	})
})

// =========================================================================================================================
// =================================================Utility functions=======================================================

function list_all(){
	eventent.list$(function(err,dblist){
		if( err ) return done(err)
	  console.log("\n\t\t ---");
	  console.log("\t\tEvents\n");
		dblist.forEach(function(element){
			console.log(element + '\n')
		})
	  console.log("\n\t\t ---\n");
	})

	teament.list$(function(err,dblist){
		console.log("\n\t\t ---");
		console.log("\t\tTeams\n");
		if( err ) return done(err)
		dblist.forEach(function(element){
			console.log(element + '\n')
		})
		console.log("\n\t\t ---\n");
	})

	userent.list$(function(err,dblist){
		console.log("\n\t\t ---");
		console.log("\t\tUsers\n");
		if( err ) return done(err)
		dblist.forEach(function(element){
			console.log(element + '\n')
		})
		console.log("\n\t\t ---\n");
	})
}

function showCommands(){
  console.log("\n\t\t---");
  console.log("\tSENECA COMMANDS AVAILABLE:\n");
  seneca.list().forEach(function(element){ console.log(element)})
  console.log("\n\t\t---\n");
}

function showRoutes(){
  seneca.act('role:web, cmd:routes', function(err, routes) {
    console.log("\n\t\t---");
    console.log("\tSENECA ROUTES AVAILABLE:\n");
    console.log(routes);
    console.log("\n\t\t---\n");
  });
}
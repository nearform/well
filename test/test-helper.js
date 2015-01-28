module.exports =
function(){
	var seneca  = require('seneca')()
	this.seneca = seneca

	// Init well.js
	seneca.use('options','../options.well.js')
	var options = seneca.export('options')
	options.dev_setup = options.well.dev_setup // <- This is not normal, check if app should really work like this

	seneca.use('user')
	seneca.use('../well',options)

	var userent  = seneca.make('sys/user')
	this.userent = userent
	var teament  = seneca.make('team')
	this.teament = teament
	var eventent  = seneca.make('event')
	this.eventent = eventent

	this.list_all = function list_all(){
		eventent.list$(function(err,dblist){
			if( err ) return console.error(err)
		  console.log("\n\t\t ---")
		  console.log("\t\tEvents\n")
			dblist.forEach(function(element){
				console.log(element + '\n')
			})
		  console.log("\n\t\t ---\n");
		})

		teament.list$(function(err,dblist){
			console.log("\n\t\t ---")
			console.log("\t\tTeams\n")
			if( err ) return console.error(err)
			dblist.forEach(function(element){
				console.log(element + '\n')
			})
			console.log("\n\t\t ---\n")
		})

		userent.list$(function(err,dblist){
			console.log("\n\t\t ---")
			console.log("\t\tUsers\n")
			if( err ) return console.error(err)
			dblist.forEach(function(element){
				console.log(element + '\n')
			})
			console.log("\n\t\t ---\n")
		})
	}

	this.show_commands = function show_commands(){
		console.log("\n\t\t---")
		console.log("\tSENECA COMMANDS AVAILABLE:\n")
		seneca.list().forEach(function(element){ console.log(element)})
		console.log("\n\t\t---\n")
	}

	this.show_routes = function show_routes(){
		seneca.act('role:web, cmd:routes', function(err, routes) {
			console.log("\n\t\t---")
			console.log("\tSENECA ROUTES AVAILABLE:\n");
			console.log(routes)
			console.log("\n\t\t---\n")
		})
	}
}
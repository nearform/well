module.exports =
  function() {

    var Hippie = require('hippie')
    var _      = require('lodash')

    // Storing login credentials for optimization
    var creds = {}
    // Storing event-user relationships for optimization
    var joined = {}

    var base = 'http://172.17.0.216:3333'

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
    this.auth_get = function auth_get(args, callback){
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
        this.login(args.login, args.password, function(err, session, login_key){
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
    this.login = function login(login, password, callback){

      // Login
      var hippie = new Hippie()

      var url = '/auth/login?username=' + login + '&password=' + password

      hippie
        .base(base)
        .get(url)
        .expectStatus(301)
        .end(function(err, res) {
          if (res.headers.location === '#fail') console.log(res.body)
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
    this.join = function join(args, callback){
      if (!args.event) callback(new Error('No event specified'))
      if (!args.login) args.login = 'admin'
      var event = joined[args.event]

      // If joined already - return
      if (event && event.members.indexOf(args.login) > -1) return callback()

      args.url = '/well/' + args.event + '/whoami'
      args.status = 200
      args.type = 'json'
      this.auth_get(args, function(err, res){
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
}
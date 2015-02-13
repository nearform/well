// ADD COPYRIGHT INFO OR A DISCLAIMER
"use strict";
process.setMaxListeners(0)

var assert = require('assert')
var util   = require('util')
var Hippie = require('hippie')
var _      = require('lodash')

var base = 'http://localhost:3333'

describe('acceptance testing', function(){

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
    var hippie = new Hippie()
    login('admin', 'admin', function(session, login) {
      hippie
        .base(base)
        .header('Cookie', 'connect.sid=' + session + '; seneca-login=' + login)
        .get('/well/ma/whoami')
        .expectStatus(200)
        .expectHeader('Content-Type', 'application/json')
        .expect(function(res, body, next) {
          var err = assert.equal(JSON.parse(res.body).user.nick, 'admin');
          next(err);
        })
        .end(function(err, res) {
          if (err) throw err
          done()
        })
    })
  })

})

// ---
// Utility Methods

function test_entity(entity, done) {
  // Hippie does not flush its expectations field after use
  // God knows what else it does not flush,
  // so make a new instance in each test case
  var hippie = new Hippie()
  login('admin', 'admin', function(session, login) {
    hippie
      .base(base)
      .header('Cookie', 'connect.sid=' + session + '; seneca-login=' + login)
      .get('/data-editor/rest/' + entity)
      .expectStatus(200)
      .expectHeader('Content-Type', 'application/json')
      .expect(function(res, body, next) {
        var err = assert.equal(JSON.parse(res.body).list.length > 0, true);
        next(err);
      })
      .end(function(err, res) {
        if (err) throw err
        done()
      })
  })
}

function login(login, password, callback){

  // Login
  var hippie = new Hippie()
  hippie
    .base(base)
    .get('/auth/login?username=' + login + '&password=' + password)
    .expectStatus(301)
    .end(function(err, res) {

      // Get cookies
      var login
      var session
      var cookies = res.headers['set-cookie'].toString().split(';')
      _.each(cookies, function(cookie){
        if (cookie.indexOf('seneca-login') > -1) login = cookie.split('=')[1]
        if (cookie.indexOf('connect.sid') > -1) session = cookie.split('=')[1]
      })

      // Return cookies
      callback(session, login)

      if (err) throw err
  })
}
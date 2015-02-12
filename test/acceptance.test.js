// ADD COPYRIGHT INFO OR A DISCLAIMER
"use strict";
process.setMaxListeners(0)

var assert = require('assert')
var util   = require('util')
var Hippie = require('hippie')
var _      = require('lodash')

describe('acceptance testing', function(){

  it('data-editor/', function(done){
  // Hippie does not flush its expectations field after use
  // God knows what else it does not flush,
  // so make a new instance in each test case
  var hippie = new Hippie()

    hippie
      .base('http://localhost:3333')
      .get('/data-editor/')
      .expectStatus(200)
      .expectHeader('Content-Type', 'text/html; charset=UTF-8')
      .end(function(err, res) {
        if (err) throw err
        done()
      })  
  })

  it('data-editor/config', function(done){
  var hippie = new Hippie()
    hippie
      .base('http://localhost:3333')
      .get('/data-editor/config')
      .expectStatus(200)
      .expectHeader('Content-Type', 'application/json')
      .end(function(err, res) {
        if (err) throw err
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
// Utility Methods

function test_entity(entity, done){
  var hippie = new Hippie()
  login('admin', 'admin', function(session, login){
    hippie
      .base('http://localhost:3333')
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
    }) })
}

function login(login, password, callback){

  // Login
  var hippie = new Hippie()
  hippie
    .base('http://localhost:3333')
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
// ADD COPYRIGHT INFO OR A DISCLAIMER
"use strict";
process.setMaxListeners(0)

var assert = require('assert')
var util   =  require('util')
var hippie = require('hippie')()

describe('acceptance testing', function(){

  it('data-editor/', function(done){
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
  hippie.expectations = [] // Hippie does not flush its expectations
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
})
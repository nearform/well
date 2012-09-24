"use strict";

var seneca  = require('seneca')
var _       = require('underscore')

var config  = require('./config.mine.js')


module.exports = function(init_opts,cb) {
  var opts = _.extend({
    xlog:'print'
  },init_opts)

  var si = seneca(opts)

  si.use('echo')
  si.use('util')

  si.use( require('seneca-user') )
  si.use( require('seneca-auth'), config.auth )

  si.use( require('./well-plugin') )

  si.ready(cb)

  return si
}
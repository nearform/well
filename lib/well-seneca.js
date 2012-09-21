"use strict";

var seneca  = require('seneca')



module.exports = function(opts,cb) {
  var si = seneca(opts)

  si.use('echo')
  si.use('util')

  si.use( require('seneca-user') )
  si.use( require('seneca-auth') )

  si.use( require('./well-plugin') )

  si.ready(cb)

  return si
}
// ADD COPYRIGHT INFO OR A DISCLAIMER
"use strict"

var seneca = require('seneca')()

// load options
try {
  require('fs').statSync( './options.well.js' )
}
catch(e) {
  process.exit( !console.error( 'Please copy options.example.js to options.well.js: ' + e))
}
seneca.use('options', './options.well.js')

// open db service
seneca
.use('jsonfile-store', {folder:'./data/'})
.listen({pins:['role:entity, cmd:*',  'cmd:ensure_entity',  'cmd:define_sys_entity']})

// console.log(process.env.HOSTNAME)
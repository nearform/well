var fs   = require('fs')
var util = require('util')
var _    = require('lodash')

var options_path = '../../../options.well.js'
var options      = require(options_path)
var output       = ''

function out(str){
  output += str + '\n'
}

function outf(key, value){
  output += key + '\n' + value + '\n'
}

function outlist(name){
  if (options.dbt[name]){
    out(name)
    _.each(options.dbt[name], function(field){
      out('@' + field)
    })
    out('!')
  }
}

if (options.dbt) {
  out('app')
  outf('workdir', options.dbt.workdir)
  out('!')

  outlist('dockimages')
  outlist('dockrebuilds')
  outlist('cleanups')
}
if (options['mysql-store']){
  out('mysql')
  outf('user', options['mysql-store'].user)
  outf('name', options['mysql-store'].name)
  outf('password', options['mysql-store'].password)
  outf('schema', options['mysql-store'].schema)
  out('!')
}
if (options['postgresql-store']){
  out('postgres')
  outf('username', options['postgresql-store'].username)
  outf('password', options['postgresql-store'].password)
  outf('schema', options['postgresql-store'].schema)
  out('!')
}

fs.writeFileSync(__dirname + "/temp.conf.out", output)
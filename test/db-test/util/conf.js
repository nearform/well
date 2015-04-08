var fs = require('fs')
var util = require('util')

var options_path = '../../../options.well.js'
var options      = require(options_path)
var output       = ''

function out(str){
  output += str + '\n'
}

function outf(key, value){
  output += key + '\n' + value + '\n'
}

if (options['db-test']) {
  out('app')
  outf('workdir', options['db-test'].workdir)
  out('!')
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

// TODO put this in readme for adding new dbs
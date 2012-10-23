
bb.init = function() {
  console.log('bb.init')
}

app.init = function() {
  console.log('app.init')
  app.platform()
  bb.init()
}

app.init()

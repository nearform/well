
bb.init = function() {
  console.log('bb.init')
}

app.init = function() {
  console.log('app.init')
  app.platform()
  bb.init()

  app.store =  new Store('well-')
  app.user = new User(app.store).load()

  console.log(app.user)
}

app.init()

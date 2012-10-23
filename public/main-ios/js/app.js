
var app = {
  model: {},
  view: {}
}

var bb = {
  model: {},
  view: {}  
}

app.platform = function(){
  console.log('ios')
}
bb.init = function() {
  console.log('bb.init')
}

app.init = function() {
  console.log('app.init')
  app.platform()
  bb.init()
}

app.init()

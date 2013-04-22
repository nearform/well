

function log() {
  console.log(arguments)
}

function printjson() { 
  var arg = arguments[0] || arguments[1]
  console.log(JSON.stringify( arg )) 
}

var http = {
  req: function(method,url,data,win,fail) {
    $.ajax({
      url:         url,
      type:        method,

      contentType: data ? 'application/json' : undefined,
      data:        data ? JSON.stringify(data) : undefined,
      dataType:    'json',
      cache:       false,

      success:     win || log,
      error:       fail || win || log
    })
  },


  post: function(url,data,win,fail) {
    http.req('POST',url,data,win,fail)
  },

  put: function(url,data,win,fail) {
    http.req('PUT',url,data,win,fail)
  },

  get: function(url,win,fail) {
    http.req('GET',url,null,win,fail)
  },

  del: function(url,win,fail) {
    http.req('DELETE',url,null,win,fail)
  }
}



function Store(prefix) {
  var self = {}

  prefix = prefix || ''

  self.load = function(key) {
    var str = localStorage[prefix+key]
    if( str && str.match(/^\{.*\}$/) ) {
      try {
        return JSON.parse(str)
      }
      catch( e ) {
        console.log(e)
        return null
      }
    }
    else return null;
  }

  
  self.save = function(key,obj) {
    if( _.isString(key) && 0 < key.length ) {
      if( _.isObject(obj) && !_.isArray(obj) ) {
        localStorage[prefix+key] = JSON.stringify(obj)
      } 
      else throw new Error('Store: not an object: '+obj);
    } 
    else throw new Error('Store: invalid key: '+key);
  }


  return self
}




function User(store) {
  var self = {}

  self.load = function() {
    _.extend( self, store.load('user') )
    return self
  }

  self.save = function() {
    store.save( 'user', self )
    return self
  }

  self.login = function( username, password, win, fail ) {
    http.post('/auth/login',{username:username,password:password},function(result){
      self.token = result.login.token
      self.when  = result.login.when
      self.email = result.user.email
      self.name  = result.user.name

      self.save()
      win()
    },fail)
  }

  return self
}



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

  app.store =  new Store('well-')
  app.user = new User(app.store).load()

  console.log(app.user)
}

app.init()

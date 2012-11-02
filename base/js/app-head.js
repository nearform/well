
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



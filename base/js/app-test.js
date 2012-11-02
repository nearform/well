
;(function(){
  console.log('TESTING...')

  var assert = require('assert')

  var store = new Store('test')
  store.save('foo',{a:1})
  var out  = store.load('foo')
  assert.equal( out.a, 1 )

  try { store.save(null,{}); assert.fail() } catch(e) {}
  try { store.save('',{}); assert.fail() } catch(e) {}
  try { store.save('a',null); assert.fail() } catch(e) {}
  try { store.save('a',[1]); assert.fail() } catch(e) {}

  console.log('DONE')
})();
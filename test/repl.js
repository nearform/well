eyes = require('eyes')
see = function(e,o){eyes.inspect(o)}

si = require('../lib/well-seneca')()
si.inrepl()

w = si.pin({role:'well',cmd:'*'})
w.createevent({name:'foo'},function(e,o){e1=o})

u = si.pin({role:'user',cmd:'*'})
u.register({nick:'u1',password:'u1'},function(e,o){u1=o})
u.register({nick:'u2',password:'u2'},function(e,o){u2=o})
u.register({nick:'u3',password:'u3'},function(e,o){u3=o})
u.register({nick:'u4',password:'u4'},function(e,o){u4=o})

w.joinevent({event:e1.id,user:u1,team:0,card:0})
w.joinevent({event:e1.id,user:u2,team:1,card:1})
w.joinevent({event:e1.id,user:u3,team:1,card:2})
w.joinevent({event:e1.id,user:u4,team:1,card:3})

w.well({event:e1.id,user:u1,other:'u2',card:1})
w.well({event:e1.id,user:u2,other:'u3',card:0})
w.well({event:e1.id,user:u3,other:'u4',card:3})


//si.act({role:'mem-store',cmd:'dump'},see)

w.getuser({nick:'u1',event:e1.id},see)
w.getuser({nick:'u2',event:e1.id},see)
w.getuser({nick:'u3',event:e1.id},see)
w.getuser({nick:'u4',event:e1.id},see)

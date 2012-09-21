/* Copyright (c) 2012 Richard Rodger */

var _ = require('underscore')


function noop(){}

// rand int between 0..bound-1
function rand(bound) {
  return Math.floor(bound * Math.abs(Math.random()))
}


var names = ["accelerator","airbag","air conditioner","air conditioning","air filter","air vent","alarm","all-wheel drive","alternator","antenna","anti-lock brakes","armrest","auto","automatic transmission","automobile","axle","baby car seat","baby seat","back-up lights","battery","bench seat","bonnet","brake light","brake pedal","brakes","bucket seat","bumper","camshaft","car","carburetor","catalytic converter","chassis","child car seat","chrome trim","clutch","computer","console","cooling system","crankshaft","cruise control","cylinder","dashboard","defroster","diesel engine","dip stick","differential","door","door handle","drive belt","drive shaft","driver's seat","emergency brake","emergency lights","emissions","engine","engine block","exhaust pipe","exhaust system","fan belt","fender","filter","floor mat","fog light","four-wheel drive","frame","fuel","fuel cap","fuel gauge","fuse","gas","gasket","gas pedal","gas gauge","gasoline","gas tank","gauge","gearbox","gear shift","gear stick","glove compartment","GPS","grille","hand brake","headlamp","headlight","headrest","heater","high-beam headlights","hood","horn","hubcap","hybrid","ignition","instrument panel","interior light","internal combustion engine","jack","key","license plate","lights","lock","low-beam headlights","lug bolt","lug nut","manifold","manual transmission","mat","mirror","moon roof","motor","mud flap","muffler","navigation system","odometer","oil","oil filter","oil tank","parking brake","parking lights","passenger seat","pedal","piston","power brakes","power steering","power window switch","radiator","radio","rag top","rear-view mirror","rear window defroster","reverse light","rims","roof","roof rack","rotary engine","seat","seat belt","shift","shock absorber","side airbags","side mirror","spare tire","spark plug","speaker","speedometer","spoiler","starter","steering column","steering wheel","sunroof","sun visor","suspension","tachometer","tailgate","temperature gauge","thermometer","tire","trailer hitch","transmission","trim","trip computer","trunk","turbo charger","turn signal","undercarriage","unleaded gas","valve","vents","visor","warning light","wheel","wheel well","window","windshield","windshield wiper"]


function maketeamname(tnum,modulo){
  var nI = (tnum * modulo) % names.length
  return names[nI]
}



function WellPlugin() {
  var self = {}
  self.name = 'well'


  var si, opts, userent, teament, eventent


  function sanitizeuser( orig, opts ) {
    opts = opts || {}
    var out = {
      nick:orig.nick,
      team:orig.team,
      name:orig.name,

      card:opts.private?orig.card:undefined,
      email:opts.private?orig.email:undefined,
    }
  }


  function loadevent(eventid,cb,win) {
    eventent.load$({id:eventid},si.err(cb,function(event){
      if( !event ) {
        return si.fail('unknown event: '+eventid,cb)
      }
      else win(event);
    }))
  }

  self.createevent = function(args,cb){
    var event = eventent.make$(_.extend({
      numcards: 52,
      numteams: 20,
      name:     'example',
      modulo:   rand(9),
      users:    {}
    },args))

    event.save$(si.err(cb,function(event){
      for( var tI = 0; tI < event.numteams; tI++ ) {
        var team = teament.make$({
          num:tI, 
          event:event.id, 
          name:maketeamname(tI,event.modulo), 
          wells:{},
          numwells:0,
          users:{}
        })
        team.save$(si.err(cb,noop))
      }
    }))
  }


  self.register = function(args,cb){
    args.parent$(args,si.err(cb,function(out){
      console.log('wr:'+JSON.stringify(args)+' '+JSON.stringify(out))
      if( out.exists ) return cb(null,out)
      var user = out.user
      user.events = user.events || {}
      user.save$(cb)
    }))
  }


  // should use nick
  self.joinevent = function(args,cb){
    var eventid = args.event
    var user    = args.user

    loadevent(eventid,cb,function(event){
      var card = rand( event.numcards )
      var tnum = rand( event.numteams )      

      event.users[user.nick]={t:tnum}
      event.save$(si.err(cb,function(event){

        user.events = user.events || {}
        user.events[eventid]=1
        user.save$(si.err(cb,function(){
      
          teament.load$({num:tnum,event:eventid},si.err(cb,function(team){
            if( !team ) return si.fail('unknown team: '+tnum+' event:'+eventid,cb);

            team.users[user.nick]=1
          }))
        }))
      }))
    })
  }



  self.getteam = function(args,cb){
    var eventid = args.event
    var teamnum = args.team
    teament.list$({num:teamnum,event:eventid},cb)
  }

  self.getevent = function(args,cb){
    var eventid = args.event
    eventent.load$({id:eventid},cb)
  }


  self.getuser = function(args,cb){
    var eventid = args.event

    var term = _.find(['id','nick','email','twid'],function(t){return !_.isUndefined(args[t])})

    console.log('term='+term)

    if( term ) {
      var q = {}
      q[term]=args[term]
      userent.load$(q,si.err(cb,function(user){
        if( user && eventid ) {
          loadevent(eventid,cb,function(event){
            var usermeta = event.users[user.nick]
            if( usermeta ) {
              teament.load$({num:usermeta.t,event:eventid},si.err(cb,function(team){
                user.team = team
                cb(null,user)
              }))
            }
          })
        }
        else cb(null,user);
      }))
    }
    else si.fail("no suitable search term for user",cb)
  }


  // MAKE IT WORK
  // should use nick
  self.well = function(args,cb){
    var eventid = args.event
    var user    = args.user
    var other   = args.other // other nick

    loadevent(eventid,cb,function(event){
      var usermeta = event.users[user.nick]
      if( !usermeta ) return self.fail('unknown user '+user.nick+' in event '+eventid)

      // need to make sure both on same team in same event
      // and check for card!!!

      teament.load$({event:eventid,num:usermeta.t},si.err(cb,function(team){
        (team.well[user.nick] = (team.well[user.nick] || {}))[other]     = 1
        (team.well[other]     = (team.well[other]     || {}))[user.nick] = 1
        team.numwells++

        team.save$(cb)
      }))      
    })
  }



  self.init = function(init_si,init_opts,cb){
    si   = init_si
    opts = _.extend({},init_opts)
    

    si.act({role:'user',cmd:'entity',kind:'user'},si.err(cb,function(user){
      userent = user
    }))

    teament  = si.make('team')
    eventent = si.make('event')


    si.add({role:'user',cmd:'register'},    self.register)

    si.add({role:self.name,cmd:'createevent'}, self.createevent)
    si.add({role:self.name,cmd:'joinevent'},   self.joinevent)
    si.add({role:self.name,cmd:'getevent'},    self.getevent)
    si.add({role:self.name,cmd:'getteam'},     self.getteam)
    si.add({role:self.name,cmd:'getuser'},     self.getuser)
    si.add({role:self.name,cmd:'well'},        self.well)

    cb()
  }




  self.service = function(opts,cb) {
    return function(req,res,next){
      next()
    }
  }

  return self
}



module.exports = new WellPlugin()



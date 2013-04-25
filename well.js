"use strict";

var _ = require('underscore')





module.exports = function( options, register ){
  var seneca = this
  var name = 'well'

  options = seneca.util.deepextend({
    numcards: 52,
    numteams: 5,
  },options)


  var userent
  seneca.act('role:user, cmd:entity, kind:user',function(err, user){
    if( err ) return register(err);
    userent = user
  })

  var teament  = seneca.make('team')
  var eventent = seneca.make('event')


  seneca.add({role:name,cmd:'whoami'},   whoami)
  seneca.add({role:name,cmd:'members'},   members)

  seneca.add({role:name,cmd:'createevent'}, createevent)
  seneca.add({role:name,cmd:'joinevent'},   joinevent)
  seneca.add({role:name,cmd:'getevent'},    getevent)
  //seneca.add({role:name,cmd:'getteam'},     getteam)
  //seneca.add({role:name,cmd:'getuser'},     getuser)
  seneca.add({role:name,cmd:'well'},        well)

  seneca.add({role:'user',cmd:'register'},      function register(args,done){
    this.parent(args,function(err,out){
      if( out.exists ) return done(err,out)
      var user = out.user
      user.events = user.events || {}
      user.save$(function(err,user){
        out.user = user
        done(err,out)
      })
    })
  }
)



  function createevent( args, done ){
    var event = eventent.make$(_.extend({
      numcards: options.numcards,
      numteams: options.numteams,
      name:     'example',
      modulo:   rand(9),
      users:    {}
    },_.omit(args,['role','cmd'])))

    event.save$( function(err, event){
      if( err ) return done(err);

      seneca.util.recurse(
        event.numteams,
        function( index, next ){
          teament
            .make$({
              num:index, 
              event:event.id, 
              name:maketeamname(index,event.modulo), 
              wells:{},
              numwells:0,
              users:{}
            })
            .save$(next)
        },
        function(err){
          done(err,event)
        }
      )
    })
  }




  function joinevent( args, done ){
    var event = args.event
    var user    = args.user
    
    // already joined
    if( event.users[user.nick] ) {
      return done(null,event)
    }

    var card = _.isUndefined(args.card) ? rand( event.numcards ) : args.card
    var tnum = _.isUndefined(args.team) ? rand( event.numteams ) : args.team

    event.users[user.nick] = {t:tnum,c:card}

    event.save$( function(err,event){
      if( err ) return done(err);
      
      user.events = user.events || {}
      user.events[event.id] = {t:tnum,c:card}
      
      user.save$( function(err, user) {
        if( err ) return done(err);
        
        teament.load$({num:tnum,event:event.id},function(err,team){
          if( err ) return done(err);
          if( !team ) return seneca.fail('unknown team: '+tnum+' event:'+event.id,done);
          
          team.users[user.nick]={card:card,name:user.name}
          team.save$(function(err){
            var out = {user:user,team:team,event:event}
            //console.dir(out)
            done(err,out)
          })
        })
      })
    })
  }




  function members( args, done ){
    var event = args.event
    var team  = args.team
    //teament.load$({num:teamnum,event:event.id},function(err,team){
    //if( err ) return done(err);
    console.dir(team)
    var members = []
    _.each(team.users,function(user,nick){
      members.push( {nick:nick,name:user.name} )
    })
    done(null,{members:members})
    //})
  }



  function getevent( args, done ){
    var event = args.event
    eventent.load$({id:event.id},done)
  }


/*
  function getuser(args,done){
    var eventid = args.event

    var term = _.find(['id','nick','email','twid'],function(t){return !_.isUndefined(args[t])})

    if( term ) {
      var q = {}
      q[term]=args[term]

      userent.load$(q,function(err,user){
        if( err ) return done(err);

        if( user && eventid ) {
          loadevent(eventid,function(err,event){
            if( err ) return done(err);

            var usermeta = event.users[user.nick]

            if( usermeta ) {
              teament.load$({num:usermeta.t,event:eventid},function(err,team){
                if( err ) return done(err);

                user.team = team
                done(null,user)
              })
            }
            else return done(null,user);
          })
        }
        else return done(null,user);
      })
    }
    else seneca.fail("no suitable search term for user",done)
  }
*/



  function whoami( args, done ) {
    var seneca = this
    var user  = args.user
    var event = args.event

    if( user ) {
      if( !user.events[event.id] ) {
        seneca.act('role:well, cmd:joinevent',{user:user,event:event}, finish)
      }
      else {
        teament.load$({event:event.id,num:user.events[event.id].t},function(err,team){
          finish(err,{user:user,team:team,event:event})
        })
      }
    }
    else done(null,{})

    function finish(err,out) {
      if(err) return done(err);
      seneca.act('role:user, cmd:clean',{user:out.user},function(err,user){
        out.user = user
        done(null,out)
      })
    }
  }



  function well(args,done){
    var event   = args.event
    var user    = args.user
    var other   = args.other // other nick
    var card    = args.card

    var usermeta = event.users[user.nick]
    if( !usermeta ) return seneca.fail('unknown user '+user.nick+' in event '+event.id,done)

    teament.load$({event:event.id,num:usermeta.t},function(err,team){
      if( err ) return done(err);

      if( !team ) return seneca.fail('unkown team '+usermeta.t+' for user '+user.nick+' at event '+event.id,done)
      
      var otherusermeta = event.users[other]
      if( !otherusermeta ) return seneca.fail('unkown user '+other+' at event '+event.id,done)


      if( otherusermeta.t == usermeta.t ) {

        if( card == otherusermeta.c ) {
          team.wells[user.nick] = (team.wells[user.nick] || {})
          team.wells[user.nick][other]     = 1

          team.wells[other]     = (team.wells[other]     || {})
          team.wells[other][user.nick] = 1

          team.numwells++

          team.save$(done)
        }
        else return seneca.fail('Well from user '+user.nick+' to '+other+' fails as card does not match, event '+event.id,done)
      }
      else return seneca.fail('Well from user '+user.nick+' to '+other+' fails as not on same team for event '+event.id,done)
    })
  }








  function sanitizeuser( orig, opts ) {
    opts = opts || {}
    orig = orig || {}
    var out = {
      nick:orig.nick,
      team:orig.team,
      name:orig.name,

      card:opts.private?orig.card:undefined,
      email:opts.private?orig.email:undefined,
      events:opts.private?orig.events:undefined,
    }
    return out
  }


/*
  function loadevent(eventid,cb) {
    eventent.load$({id:eventid},function(err,event){
      if( err ) return cb(err);

      if( !event ) {
        return seneca.fail('unknown event: '+eventid,cb)
      }
      else cb(null, event);
    })
  }
*/


  this.act({
    role:'util',
    cmd:'ensure_entity',
    pin:{role:'well',cmd:'*'},
    entmap:{
      event:eventent,
      user:userent,
      team:teament,
    }
  })



  register(null,{
    name:name,
    service:seneca.http({
      prefix:'/well/',
      pin:{role:name,cmd:'*'},
      map:{

        whoami:{GET:function(req,res,args,act,respond) {
          args.user = req.seneca.user
          act(args,respond)
        }},

        members:{ alias:'player/members/:team' },
        
        getevent:{ suffix:'/:event' }, // GET without dispatch is default

        
        getuser:{ suffix:'/:nick', GET:function(req,res,args,act,respond){
          act(args,function(err,user){
            if( err ) { return res.send(500,err) }
            var myself = req.seneca.user && req.seneca.user.id==user.id
            user = sanitizeuser(user,{private:myself})
            respond(null,user)
          })
        }},
        
        well:{POST:function(req,res,args,act,done) {
          args.user = req.seneca.user
          act(args,done)
        }}
      }
    })
  })

}




// rand int between 0..bound-1
function rand(bound) {
  return Math.floor(bound * Math.abs(Math.random()))
}


var names = ["accelerator","airbag","air conditioner","air conditioning","air filter","air vent","alarm","all-wheel drive","alternator","antenna","anti-lock brakes","armrest","auto","automatic transmission","automobile","axle","baby car seat","baby seat","back-up lights","battery","bench seat","bonnet","brake light","brake pedal","brakes","bucket seat","bumper","camshaft","car","carburetor","catalytic converter","chassis","child car seat","chrome trim","clutch","computer","console","cooling system","crankshaft","cruise control","cylinder","dashboard","defroster","diesel engine","dip stick","differential","door","door handle","drive belt","drive shaft","driver's seat","emergency brake","emergency lights","emissions","engine","engine block","exhaust pipe","exhaust system","fan belt","fender","filter","floor mat","fog light","four-wheel drive","frame","fuel","fuel cap","fuel gauge","fuse","gas","gasket","gas pedal","gas gauge","gasoline","gas tank","gauge","gearbox","gear shift","gear stick","glove compartment","GPS","grille","hand brake","headlamp","headlight","headrest","heater","high-beam headlights","hood","horn","hubcap","hybrid","ignition","instrument panel","interior light","internal combustion engine","jack","key","license plate","lights","lock","low-beam headlights","lug bolt","lug nut","manifold","manual transmission","mat","mirror","moon roof","motor","mud flap","muffler","navigation system","odometer","oil","oil filter","oil tank","parking brake","parking lights","passenger seat","pedal","piston","power brakes","power steering","power window switch","radiator","radio","rag top","rear-view mirror","rear window defroster","reverse light","rims","roof","roof rack","rotary engine","seat","seat belt","shift","shock absorber","side airbags","side mirror","spare tire","spark plug","speaker","speedometer","spoiler","starter","steering column","steering wheel","sunroof","sun visor","suspension","tachometer","tailgate","temperature gauge","thermometer","tire","trailer hitch","transmission","trim","trip computer","trunk","turbo charger","turn signal","undercarriage","unleaded gas","valve","vents","visor","warning light","wheel","wheel well","window","windshield","windshield wiper"]


function maketeamname(tnum,modulo){
  var nI = (tnum * modulo) % names.length
  return names[nI]
}

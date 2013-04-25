Ext.define('well.controller.Connect', {
  extend: 'Ext.app.Controller',

  config: {
    refs: {
      team: 'wellteam',
      suit: 'wellsuit',
      number: 'wellnumber'
    },
    control: {
      wellnumber: {
        show:'onNumber'
      },

      'wellsuit button': {
        tap: 'tapSuit'
      },
      'wellnumber button': {
        tap: 'tapNumber'
      }
    }
  },


  onNumber: function(wellsuit) {
    var suit = wellsuit.config.data.suit
    var topleft  = this.getNumber().down('#num-top-left')    
    var topright = this.getNumber().down('#num-top-right')    
    var color = ('hearts'==suit || 'diams'==suit) ? 'red' : 'black'
    topleft.setHtml( '<font color="'+color+'">&'+suit+';</font>' )
    topright.setHtml( '<font color="'+color+'">&'+suit+';</font>' )
  },


  tapSuit: function(button) {
    console.log('tapSuit',button.id)

    this.getTeam().push({
      xtype: 'wellnumber',
      title: app.upperFirst(button.id),
      data:  {suit:button.id}
    })
  },


  tapNumber: function(button) {
    var data  = this.getSuit().config.data
    var other = data.nick
    var name  = data.name
    var card  = (app.suitindex[this.getNumber().config.data.suit] * 13) + app.numberindex[button.id]
    console.log('tapNumber card',card,other)

    wrongCard = this.wrongCard

    var team = this.getTeam()
    Ext.Ajax.request({
      url: '/well/player/well/'+other+'/'+card,
      method:'POST',
      success: function (response) {
        var resobj = Ext.JSON.decode(response.responseText);
        if( resobj.team ) {
          app.team = resobj.team
          team.reset()

          team.push({
            xtype: 'wellmember',
            title: name,
            data: data
          })

          var teamstore = Ext.getStore('Team')
          teamstore.load(function(){
            console.log('Connect getteam')
          })
        }
        else wrongCard(name)

      },
      failure: function (response) {
        wrongCard(name)
      }
    })

  },




  wrongCard: function(name) {
    Ext.Msg.alert('Sorry!', "That's not the right card for "+name, Ext.emptyFn);
  }



});



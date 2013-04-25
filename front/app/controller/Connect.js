Ext.define('well.controller.Connect', {
  extend: 'Ext.app.Controller',

  config: {
    refs: {
      team: 'wellteam',
      suit: 'wellsuit',
      number: 'wellnumber'
    },
    control: {
      wellsuit: {
        activate:'onSuit'
      },

      'wellsuit button': {
        tap: 'tapSuit'
      },
      'wellnumber button': {
        tap: 'tapNumber'
      }
    }
  },

  onSuit: function(wellsuit) {
    console.log('onSuit',wellsuit.config.data)
  },

  tapSuit: function(button) {
    console.log('tapSuit',button.id)

    this.getTeam().push({
      xtype: 'wellnumber',
      title: button.id,
      data: {suit:button.id}
    })
  },

  tapNumber: function(button) {
    var other = this.getSuit().config.data.nick
    var name = this.getSuit().config.data.name
    var card = (app.suitindex[this.getNumber().config.data.suit] * 13) + app.numberindex[button.id]
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
            data: {nick:other,name:name}
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

/*
    var popup = new Ext.Panel({
      floating: true,
      centered: true,
      modal: true,
      width: 300,
      height: 400,
      styleHtmlContent: true,
      html: 'Hello! I\'m a PopUp',
      dockedItems: [{
        xtype: 'toolbar',
        title: 'PopUp',
        items: [{
          xtype: 'spacer'
        },{
          text: 'Close',
          handler: function(){
            popup.hide();
          }
        }]
      }]
    });
    popup.show()
 */
  }



});



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
    var card = (app.suitindex[this.getNumber().config.data.suit] * 13) + app.numberindex[button.id]
    console.log('tapNumber card',card)

    var team = this.getTeam()
    Ext.Ajax.request({
      url: '/well/player/well/'+other+'/'+card,
      method:'POST',
      success: function (response) {
        var resobj = Ext.JSON.decode(response.responseText);
        if( resobj.ok ) {
          team.reset()
        }
      },
      failure: function (response) {
        //Ext.fly('appLoadingIndicator').destroy();
      }
    })

  }

});



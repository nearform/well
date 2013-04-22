Ext.define('well.controller.Connect', {
  extend: 'Ext.app.Controller',

  config: {
    refs: {
      team: 'wellteam'
    },
    control: {
      'wellsuit button': {
        tap: 'tapSuit'
      },
      'wellnumber button': {
        tap: 'tapNumber'
      }
    }
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
    console.log('tapNumber',button.id)
  }

});

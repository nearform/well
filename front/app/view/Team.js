Ext.define('well.view.Team', {
  extend: 'Ext.navigation.View',
  xtype:'wellteam',
  requires: [
    'well.view.Suit',
    'well.view.Member'
  ],
  

  config: {

    items: [
      {
        title:'Your Team',
        xtype:'list',
        id:'wellteamlist',

        store:'Team',

        itemTpl: '{name} {nick} {well}'
      }
    ]
  },

  onShow: function() {
    console.log('Team show')
  }

});

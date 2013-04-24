Ext.define('well.view.Team', {
  extend: 'Ext.navigation.View',
  xtype:'wellteam',
  requires: ['well.view.Suit'],
  

  config: {

    items: [
      {
        title:'Your Team',
        xtype:'list',
        id:'wellteamlist',

        store:'Team',

/*
        store: {
          fields: ['name'],
          data: [
            {name: 'Cowper'},
            {name: 'Everett'},
            {name: 'University'},
            {name: 'Forest'}
          ]
        },
*/

        itemTpl: '{name} {nick}'
      }
    ]
  },

/*
  initialize: function() {
    console.log('MC init')
    var teamstore = Ext.getStore('Team')
    if( app.event && app.team ) {
      teamstore.getProxy().setUrl('/well/getteam?event='+app.event.id+'&team='+app.team.num)
      teamstore.load(function(){
        console.log('getteam')
      })
    }
  }
*/

  onShow: function() {
    console.log('Team show')
  }

});

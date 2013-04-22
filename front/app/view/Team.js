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

        store: {
          fields: ['name'],
          data: [
            {name: 'Cowper'},
            {name: 'Everett'},
            {name: 'University'},
            {name: 'Forest'}
          ]
        },

        itemTpl: '{name}'
      }
    ]
  }
});

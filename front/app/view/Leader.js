Ext.define('well.view.Leader', {
  extend: 'Ext.navigation.View',
  xtype:'wellleader',
  requires: [
  ],
  

  config: {

    items: [
      {
        title:'Leaderboard',
        xtype:'list',
        id:'wellleaderlist',

        store:'Leader',
        loadingText: null,
        itemTpl: '{name} {score}'
      }
    ]
  },

});

Ext.define('well.view.Main', {
  extend: 'Ext.tab.Panel',
  xtype: 'wellmain',
  requires: [
    'well.view.Team',
  ],
  config: {
    tabBarPosition: 'bottom',

    items: [
      {
        id:'wellmain-tab-home',
        title: 'Home',
        iconCls: 'home',

        styleHtmlContent: true,
        scrollable: true,

        items: {
          docked: 'top',
          xtype: 'titlebar',
          title: 'Home'
        },

        html: 'home'
      },
      {
        id:'wellmain-tab-team',
        title: 'Your Team',
        iconCls: 'action',
        xtype: 'wellteam',
      },
      {
        id:'wellmain-tab-leader',
        title: 'Leaderboard',
        iconCls: 'home',

        styleHtmlContent: true,
        scrollable: true,

        items: {
          docked: 'top',
          xtype: 'titlebar',
          title: 'Leaderboard'
        },

        html: 'leader'
      },
      {
        id:'wellmain-tab-help',
        title: 'Help',
        iconCls: 'help',

        styleHtmlContent: true,
        scrollable: true,

        items: {
          docked: 'top',
          xtype: 'titlebar',
          title: 'Help'
        },

        html: 'help'
      },
    ]
  },


  initialize: function() {
    console.log('MVI')
    this.callParent(arguments);
  }

});


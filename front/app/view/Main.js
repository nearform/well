Ext.define('well.view.Main', {
  extend: 'Ext.tab.Panel',
  xtype: 'wellmain',
  requires: [
    'well.view.Team',
    'well.view.Leader',
    'Ext.MessageBox',
  ],
  config: {
    tabBarPosition: 'bottom',

    items: [
      {
        id:'wellmain-tab-home',
        title: 'Home',
        iconCls: 'home',
        //xtype: 'wellhome',

        items:[
          {
            docked: 'top',
            xtype: 'titlebar',
            title: 'Home'
          },
          {
            id:'wellhome-user',
            xtype:'label',
            tpl:'{name} {nick}'
          },
          {
            id:'wellhome-team',
            xtype:'label',
            tpl:'{team}'
          },
          {
            id:'wellhome-card',
            xtype:'label',
            tpl:'{card}'
          }
        ]
      },
      {
        id:'wellmain-tab-team',
        title: 'Your Team',
        iconCls: 'list',
        xtype: 'wellteam',
      },
      {
        id:'wellmain-tab-leader',
        title: 'Leaderboard',
        iconCls: 'list',
        xtype: 'wellleader',
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


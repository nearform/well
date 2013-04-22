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
        title: 'Your Team',
        iconCls: 'action',
        xtype: 'wellteam',
      },
      {
        title: 'Home',
        iconCls: 'home',

        styleHtmlContent: true,
        scrollable: true,

        items: {
          docked: 'top',
          xtype: 'titlebar',
          title: 'Welcome to Sencha Touch 2'
        },

        html: [
          "You've just generated a new Sencha Touch 2 project. What you're looking at right now is the ",
          "contents of <a target='_blank' href=\"app/view/Main.js\">app/view/Main.js</a> - edit that file ",
          "and refresh to change what's rendered here."
        ].join("")
      },
    ]
  }
});


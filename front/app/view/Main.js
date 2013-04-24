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

    Ext.Ajax.request({
      url: '/auth/instance',
      //method: 'get',
      success: function (response) {
        var instance = Ext.JSON.decode(response.responseText);
        if( instance.user ) {
          app.user = instance.user
          app.login = instance.login

          Ext.Viewport.setActiveItem( 'wellmain' )
          //this.setActiveItem( 'wellmain' )
        }
        else {
          Ext.Viewport.setActiveItem( 'welllogin' )
        }
        //Ext.fly('appLoadingIndicator').destroy();
      },
      failure: function (response) {
        //Ext.fly('appLoadingIndicator').destroy();
      }
    })

    this.callParent(arguments);
  }

});


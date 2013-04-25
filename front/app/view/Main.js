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
        scrollable: true,

        items:[
          {
            docked: 'top',
            xtype: 'titlebar',
            title: 'Home'
          },
          { 
            xtype: 'panel', 

            layout: {
              type: 'vbox',
              align: 'center',
              autoSize: true
            },


            items: [
              {
                id:'wellhome-user',
                xtype:'label',

                tpl:[
                  '<div style="text-align:center">',
                  '<img src="{[values.avatar?app.avatar:"/resources/icons/user.png"]}"',
                  '  style="width:80px;height:80px;margin:10px;border:2px solid #ccc""></img>',
                  '<br><br><b style="font-size:2em">{name}</b>&nbsp;&nbsp;',
                  '<br><i style="font-size:1em">@{nick}</i>',
                  '</div>'
                ]
              },
              {
                id:'wellhome-team',
                xtype:'label',
                tpl:[
                  '<div style="text-align:center">',
                  '<small>Your Team:</small><br><i>{team}</i>',
                  '</div>'
                ],
                style:'font-size:1.5em;margin:20px'
              },
              {
                id:'wellhome-card',
                xtype:'label',
                tpl:[
                  '<div style="text-align:center">',
                  'Your Card: <br><div style="font-size:2em">{card}</div>',
                  '</div>'
                ],
                style:'font-size:1.5em;margin:20px'
              },
            ]
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

        html: [
          '<h1>Well!</h1>',
          '<p>',
          'Get as many points as you can by connecting with everybody on your team.',
          '</p>',
          '<p>',
          'You connect by asking another team member for their playing card, and tapping it in on the <i>Team</i> tab.',
          '</p>',
          '<p>',
          "To win, you'll need to talk to as many people as possible, check if they're on your team, and exchange cards.",
          '</p>',
          '<p>',
          'Good Luck!',
          '</p>'
        ].join('')
      },
    ]
  },


  initialize: function() {
    this.callParent(arguments);
  }

});


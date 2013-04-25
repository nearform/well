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

        itemTpl: [
          //'{[JSON.stringify(values)]}',
          '<img src="{["false"!=values.avatar?"twitter.com/":"/resources/icons/user.png"]}"',
          '  style="width:40;height:40;float:left;margin-right:5px;border:1px solid #ccc""></img>',
          '<b style="font-size:1.5em">{name}</b>&nbsp;&nbsp;',
          '<img src="/resources/icons/{["false"==values.well?"help_black.png":"favorites_circle.png"]}" width="20" height="20"></img>',
          '<br><i style="font-size:0.8em">@{nick}</i>',

        ].join('')
      }
    ]
  },

  onShow: function() {
    console.log('Team show')
  }

});

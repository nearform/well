Ext.define('well.view.Member', {
  extend: 'Ext.Panel',
  xtype: 'wellmember',
  requires: [],

  config: {

    layout: {
      type: 'vbox',
      align: 'center',
      autoSize: true
    },

    items:[
      {
        id:'wellmember-user',
        xtype:'label',

        tpl:[
          '<div style="text-align:center">',
          '<img src="{["false"!=values.avatar?"twitter.com/":"/resources/icons/user.png"]}"',
          '  style="width:80;height:80;border:2px solid #ccc""></img>',
          '<br><br><b style="font-size:2em">{name}</b>&nbsp;&nbsp;',
          '<br><i style="font-size:1em">@{nick}</i>',
          '</div>'
        ]
      },
    ]
  }
});

Ext.define('well.view.Member', {
  extend: 'Ext.Panel',
  xtype: 'wellmember',
  requires: [],

  config: {
    layout: "vbox",

    items:[

      {
        id:'wellmember-name',
        xtype:'label',
        tpl:'member: {name} {nick}'
      },

    ]
  }
});

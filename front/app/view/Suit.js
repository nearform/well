Ext.define('well.view.Suit', {
  extend: 'Ext.Panel',
  xtype: 'wellsuit',
  requires: ['well.view.Number'],

  config: {
    title: 'Suit',
    layout: "vbox",

    items:[

      { 
        xtype: 'panel', 
        layout: "hbox", 
        items: [
          {
            id:'spades',
            xtype: "button",
            ui: "normal",
            text: "&spades;" 
          },
          {
            id:'clubs',
            xtype: "button",
            ui: "normal",
            text: "&clubs;" 
          }, 
        ]
      },

      { 
        xtype: 'panel', 
        layout: "hbox",
        items: [
          {
            id:'hearts',
            xtype: "button",
            ui: "normal",
            text: "&hearts;" 
          },
          {
            id:'diams',
            xtype: "button",
            ui: "normal",
            text: "&diams;" 
          }, 
        ]
      }
    ]
  }
});

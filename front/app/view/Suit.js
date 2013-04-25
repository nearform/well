Ext.define('well.view.Suit', {
  extend: 'Ext.Panel',
  xtype: 'wellsuit',
  requires: ['well.view.Number'],

  config: {
    title: 'Suit',
    scrollable: true,

    layout: {
      type: 'vbox',
      align: 'center',
      autoSize: true
    },


    items:[

      { 
        xtype: 'panel', 
        layout: "hbox", 
        items: [
          {
            id:'spades',
            xtype: "button",
            ui: "normal",
            text: "&spades;", 
            cls:'suitbtn'
          },
          {
            id:'clubs',
            xtype: "button",
            ui: "normal",
            text: "&clubs;",
            cls:'suitbtn' 
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
            text: "&hearts;", 
            style:"color:red",
            cls:'suitbtn'
          },
          {
            id:'diams',
            xtype: "button",
            ui: "normal",
            text: "&diams;",
            style:"color:red",
            cls:'suitbtn'
          }, 
        ]
      }
    ]
  }
});

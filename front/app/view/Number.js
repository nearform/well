Ext.define('well.view.Number', {
  extend: 'Ext.Panel',
  xtype: 'wellnumber',

  config: {
    title: 'Number',
    layout: "vbox",

    items:[

      { 
        xtype: 'panel', 
        layout: "hbox", 
        items: [
          {
            id:'num-A',
            xtype: "button",
            ui: "normal",
            text: "A" 
          },
        ]
      },

      { 
        xtype: 'panel', 
        layout: "hbox", 
        items: [
          {
            id:'num-2',
            xtype: "button",
            ui: "normal",
            text: "2" 
          },
          {
            id:'num-3',
            xtype: "button",
            ui: "normal",
            text: "3" 
          },
          {
            id:'num-4',
            xtype: "button",
            ui: "normal",
            text: "4" 
          },
        ]
      },

      { 
        xtype: 'panel', 
        layout: "hbox", 
        items: [
          {
            id:'num-5',
            xtype: "button",
            ui: "normal",
            text: "5" 
          },
          {
            id:'num-6',
            xtype: "button",
            ui: "normal",
            text: "6" 
          },
          {
            id:'num-7',
            xtype: "button",
            ui: "normal",
            text: "7" 
          },
        ]
      },

      { 
        xtype: 'panel', 
        layout: "hbox", 
        items: [
          {
            id:'num-8',
            xtype: "button",
            ui: "normal",
            text: "8" 
          },
          {
            id:'num-9',
            xtype: "button",
            ui: "normal",
            text: "9" 
          },
          {
            id:'num-10',
            xtype: "button",
            ui: "normal",
            text: "10" 
          },
        ]
      },

      { 
        xtype: 'panel', 
        layout: "hbox", 
        items: [
          {
            id:'num-J',
            xtype: "button",
            ui: "normal",
            text: "J" 
          },
          {
            id:'num-Q',
            xtype: "button",
            ui: "normal",
            text: "Q" 
          },
          {
            id:'num-K',
            xtype: "button",
            ui: "normal",
            text: "K" 
          },
        ]
      },

    ]
  }
});

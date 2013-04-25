Ext.define('well.view.Number', {
  extend: 'Ext.Panel',
  xtype: 'wellnumber',

  config: {
    title: 'Number',

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
            id:'num-top-left',
            xtype: "label",
            cls:'numberbtn topsuit'
          },
          {
            id:'num-A',
            xtype: "button",
            ui: "normal",
            text: "A",
            cls:'numberbtn'
          },
          {
            id:'num-top-right',
            xtype: "label",
            cls:'numberbtn topsuit'
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
            text: "2",
            cls:'numberbtn'
          },
          {
            id:'num-3',
            xtype: "button",
            ui: "normal",
            text: "3",
            cls:'numberbtn'
          },
          {
            id:'num-4',
            xtype: "button",
            ui: "normal",
            text: "4",
            cls:'numberbtn'
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
            text: "5",
            cls:'numberbtn'
          },
          {
            id:'num-6',
            xtype: "button",
            ui: "normal",
            text: "6",
            cls:'numberbtn'
          },
          {
            id:'num-7',
            xtype: "button",
            ui: "normal",
            text: "7",
            cls:'numberbtn'
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
            text: "8",
            cls:'numberbtn'
          },
          {
            id:'num-9',
            xtype: "button",
            ui: "normal",
            text: "9",
            cls:'numberbtn'
          },
          {
            id:'num-10',
            xtype: "button",
            ui: "normal",
            text: "10",
            cls:'numberbtn'
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
            text: "J",
            cls:'numberbtn'
          },
          {
            id:'num-Q',
            xtype: "button",
            ui: "normal",
            text: "Q",
            cls:'numberbtn'
          },
          {
            id:'num-K',
            xtype: "button",
            ui: "normal",
            text: "K",
            cls:'numberbtn'
          },
        ]
      },

    ]
  }
});

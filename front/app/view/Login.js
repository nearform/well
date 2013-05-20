Ext.define('well.view.Login', {
  extend: 'Ext.form.Panel',
  xtype: "welllogin",
  config: {
    title: 'Login',

    layout: {
      type: 'vbox',
      align: 'center',
      autoSize: true
    },


    items:[
      {
        xtype:'panel',
        html:[
          'Well!'          
        ],
        style:'font-size:2em;margin:20px'
      },
      {
        id:'welllogin-event',
        xtype:'label',
        tpl:[
          'Welcome to {event}'          
        ],
        style:'font-size:1em;margin:10px',
        hidden:true
      },
 
      {
        xtype: 'button',
        ui: 'action',
        padding: '10px',
        margin: '10px',
        text: 'Login with Twitter',
        hidden:true
      },

      {
        id:'welllogin-intro',
        xtype:'panel',
        html:[
          "<p>Once you login, you'll be assigned a randomly chosen team.</p>",
          "<p>Connect with your fellow team members to win the game!</p>"
        ].join(''),
        style:'margin:30px',
        hidden:true
      },
 

    ]
  }
});

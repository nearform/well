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
        style:'font-size:2em;margin:30px'
      },
 
      {
        xtype: 'button',
        itemId: 'logInButton',
        ui: 'action',
        padding: '10px',
        margin: '10px',
        text: 'Login with Twitter'
      },

      {
        xtype:'panel',
        html:[
          "<p>Once you login, you'll be assigned to a randomly chosen team.</p>",
          "<p>Connect your fellow team members to win the game!</p>"
        ].join(''),
        style:'margin:30px'
      },
 

    ]
  }
});

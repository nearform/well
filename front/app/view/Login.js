Ext.define('well.view.Login', {
  extend: 'Ext.form.Panel',
  xtype: "welllogin",
  config: {
    title: 'Login',

    items:[
      {
        xtype: 'button',
        itemId: 'logInButton',
        ui: 'action',
        padding: '10px',
        margin: '10px',
        text: 'Login with Twitter'
      }
    ]
  }
});

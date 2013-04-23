Ext.define('well.controller.Login', {
  extend: 'Ext.app.Controller',

  config: {
    refs: {
      main:'wellmain'
    },
    control: {
      'welllogin button': {
        tap: 'tapLogin'
      },
    },
    routes: {
      'main':'showMain'
    }
  },

  tapLogin: function(button) {
    console.log('tapLogin',button.id)
    window.location.href = '/auth/twitter';
  },

  showMain: function() {
    console.log('showMain')
    var main = this.getMain()
    Ext.Viewport.setActiveItem(main)
  }

});

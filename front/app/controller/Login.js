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
      '':'showLogin',
      'main':'showMain'
    }
  },

  tapLogin: function(button) {
    console.log('tapLogin',button.id)
    window.location.href = '/auth/twitter';
  },

  showMain: function() {
    console.log('LC showMain route')
    // test for well.user here?
    //var main = this.getMain()
    //Ext.Viewport.setActiveItem(main)
    this.whoami()
  },

  showLogin: function() {
    console.log('LC showLogin route')
    // test for well.user here?
    //var main = this.getMain()
    //Ext.Viewport.setActiveItem(main)
    this.whoami()
  },


  whoami: function() {
    console.log('whoami')
    Ext.Ajax.request({
      url: '/well/whoami',
      success: function (response) {
        var resobj = Ext.JSON.decode(response.responseText);
        if( resobj.user ) {
          app.card  = resobj.card
          app.user  = resobj.user
          app.team  = resobj.team
          app.event = resobj.event

          Ext.Viewport.setActiveItem( 'wellmain' )
          //this.setActiveItem( 'wellmain' )
        }
        else {
          Ext.Viewport.setActiveItem( 'welllogin' )
        }
        //Ext.fly('appLoadingIndicator').destroy();
      },
      failure: function (response) {
        //Ext.fly('appLoadingIndicator').destroy();
      }
    })
  }

});

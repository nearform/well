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
    window.location.href = '/auth/twitter';
  },

  showMain: function() {
    this.whoami()
  },

  showLogin: function() {
    this.whoami()
  },


  whoami: function() {
    var event = /well\/([^#\/]*)/.exec(location.href)[1]
    console.log(event)

    Ext.Ajax.request({
      url: '/well/'+event+'/whoami',
      success: function (response) {
        var resobj = Ext.JSON.decode(response.responseText);
        if( resobj.user ) {
          app.card   = resobj.card
          app.user   = resobj.user
          app.team   = resobj.team
          app.event  = resobj.event
          app.avatar = resobj.avatar

          Ext.Viewport.setActiveItem( 'wellmain' )
        }
        else {
          Ext.Viewport.setActiveItem( 'welllogin' )
        }
      }
    })
  }

})

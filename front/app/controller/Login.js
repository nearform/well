Ext.define('well.controller.Login', {
  extend: 'Ext.app.Controller',

  config: {
    refs: {
      main:'wellmain',
      login:'welllogin',
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
    var authurl = '/auth/twitter?context='+app.eventcode+'&prefix=/well/'+app.eventcode+'/'
    window.location.href = authurl
  },

  showMain: function() {
    this.whoami()
  },

  showLogin: function() {
    this.whoami()
  },


  whoami: function() {
    var self = this
    var login = self.getLogin()

    login.down('label').hide()
    login.down('button').hide()
    login.down('#welllogin-intro').hide()


    Ext.Ajax.request({
      url: '/well/'+window.app.eventcode+'/whoami',
      success: function (response) {
        var resobj = Ext.JSON.decode(response.responseText);
        app.event  = resobj.event

        if( resobj.user ) {
          app.card   = resobj.card
          app.user   = resobj.user
          app.team   = resobj.team
          app.avatar = resobj.avatar

          Ext.Viewport.setActiveItem( 'wellmain' )
        }
        else {
          Ext.Viewport.setActiveItem( 'welllogin' )
        }
        self.showEvent( login )
      }
    })
  },


  showEvent: function(login) {
    login.down('#welllogin-event').setData({
      event:app.event?app.event.name:''
    })
    login.down('label').show()
    login.down('button').show()
    login.down('#welllogin-intro').show()
  }

})

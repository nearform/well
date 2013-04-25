Ext.define('well.controller.Main', {
  extend: 'Ext.app.Controller',

  config: {
    refs: {
      team: 'wellteam',
      main: 'wellmain'
    },
    control: {
      'wellmain': {
        activeitemchange:'onTabChange'
      },
      wellteam: {
        activate:'onTeam'
      },
      '#wellteamlist': {
        select: 'showDetail',
        show:'onShow'
      },
      '#wellmain-tab-home': {
        activate:'onHome'
      }

    }
  },

  showDetail: function(list, record) {
    var data = record.getData()
    console.log('showDetail',data)
    this.getTeam().push({
      xtype: 'wellsuit',
      title: data.name,
      data: data
    })
  },

  onShow: function(){
    console.log('C Main onshow')
  },

  onTabChange: function(main,tab){
    console.log('C Main tab '+tab.id)
  },

  onTeam: function(){
    console.log('on Team')
    var teamstore = Ext.getStore('Team')
    teamstore.getProxy().setUrl('/well/player/members/'+app.team.id)
    teamstore.load(function(){
      console.log('getteam')
    })
  },

  onHome: function(home){
    console.log('onHome')
    //home.config.data = home.config.data || {}
    //home.config.data.cardnumber = app.card
    //home.setData({cardnumber:'card:'+app.card})
    //console.log(home.getData())

    var card = app.reversecard(app.card)
    home.child('#wellhome-user').setData({
      nick:app.user.nick,
      name:app.user.name,
    })
    home.child('#wellhome-team').setData({
      team:app.team.name,
    })
    home.child('#wellhome-card').setData({
      card:'&'+app.suitindex[card.suit]+'; '+app.numberindex[card.number]
    })
  }
});

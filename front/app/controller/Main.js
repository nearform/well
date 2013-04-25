Ext.define('well.controller.Main', {
  extend: 'Ext.app.Controller',

  config: {
    refs: {
      team: 'wellteam',
      main: 'wellmain',
      member: 'wellmember'
    },
    control: {
      'wellmain': {
        activeitemchange:'onTabChange'
      },
      wellteam: {

      },
      '#wellteamlist': {
        select: 'showDetail',
        //show:'onTeam',
        //activate:'onTeam'
      },
      '#wellmain-tab-home': {
        activate:'onHome'
      },
      wellmember: {
        activate:'onMember'
      },

    }
  },

  showDetail: function(list, record) {
    var data = record.getData()
    console.log('showDetail',data)

    var mywells = app.team.wells[app.user.nick]
    if( mywells && mywells[data.nick] ) {
      this.getTeam().push({
        xtype: 'wellmember',
        title: data.name,
        data: {nick:data.nick}
      })
    }
    else {
      this.getTeam().push({
        xtype: 'wellsuit',
        title: data.name,
        data: data
      })
    }
  },

/*
  onShow: function(){
    console.log('C Main onshow')
  },
*/

  onTabChange: function(main,tab){
    console.log('C Main tab '+tab.id)

    app.stopLoading('team')
    app.stopLoading('leader')

    if( 'wellmain-tab-team' == tab.id ) {
      this.onTeam()
    }
    else if( 'wellmain-tab-leader' == tab.id ) {
      this.onLeader()
    }
  },

  onTeam: function(){
    console.log('on Team')
    var teamstore = Ext.getStore('Team')
    teamstore.getProxy().setUrl('/well/player/members/'+app.team.id)
    teamstore.load(function(){
      console.log('getteam')
    })
    app.startLoading('team',teamstore)
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
  },

  onMember: function(){
    var member = this.getMember()
    var other = member.config.data.nick

    console.log('MC on Member ',other)


    Ext.Ajax.request({
      url: '/well/player/member/'+other,
      success: function (response) {
        var resobj = Ext.JSON.decode(response.responseText);
        member.child('#wellmember-name').setData(resobj)
      },
      failure: function (response) {
        //Ext.fly('appLoadingIndicator').destroy();
      }
    })

  },


  onLeader: function(){
    console.log('on Leader')
    var leaderstore = Ext.getStore('Leader')
    leaderstore.load(function(){
      console.log('leader')
    })
    app.startLoading('leader',leaderstore)
  },



});

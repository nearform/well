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
      '#wellteamlist': {
        select: 'showDetail',
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

    var mywells = app.team.wells[app.user.nick]
    if( mywells && mywells[data.nick] ) {
      this.getTeam().push({
        xtype: 'wellmember',
        title: data.name,
        data: data
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
      console.log(teamstore)
    })
    app.startLoading('team',teamstore)
  },

  onHome: function(home){
    var card = app.reversecard(app.card)
    home.down('#wellhome-user').setData({
      nick:app.user.nick,
      name:app.user.name,
      avatar:app.avatar
    })
    home.down('#wellhome-team').setData({
      team:app.team.name,
    })

    var color = (2==card.suit || 3==card.suit) ? 'red' : 'black'
    home.down('#wellhome-card').setData({
      card:'<font color="'+color+'">&'+app.suitindex[card.suit]+';'+app.numberindex[card.number].substring(4)+'</font>'
    })
  },

  onMember: function(){
    var member = this.getMember()
    var other = member.config.data.nick

    Ext.Ajax.request({
      url: '/well/player/member/'+other,
      success: function (response) {
        var resobj = Ext.JSON.decode(response.responseText);
        member.child('#wellmember-user').setData(resobj)
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

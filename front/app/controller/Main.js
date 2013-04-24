Ext.define('well.controller.Main', {
  extend: 'Ext.app.Controller',

  config: {
    refs: {
      team: 'wellteam'
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
      }
    }
  },

  showDetail: function(list, record) {
    console.log('showDetail',this.getTeam())
    var data = record.getData()
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
  }
});

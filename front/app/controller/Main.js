Ext.define('well.controller.Main', {
  extend: 'Ext.app.Controller',

  config: {
    refs: {
      team: 'wellteam'
    },
    control: {
      '#wellteamlist': {
        select: 'showDetail'
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
  }

});

Ext.define('well.store.Team', {
  extend: 'Ext.data.Store',
  
  initialize: function() {
    console.log('TS init')
  },

  config: {
    model: 'well.model.Member',
    sorters: 'name',

    proxy: {
      type: 'ajax',
//      url : '/well/getteam',
      reader: {
        type: 'json',
        rootProperty: 'members'
      }
    }
  }

});

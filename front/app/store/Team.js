Ext.define('well.store.Team', {
  extend: 'Ext.data.Store',
  
  config: {
    model: 'well.model.Member',
    sorters: 'name',

    proxy: {
      type: 'ajax',
      reader: {
        type: 'json',
        rootProperty: 'members'
      }
    }
  }

});

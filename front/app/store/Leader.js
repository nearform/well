Ext.define('well.store.Leader', {
  extend: 'Ext.data.Store',
  
  config: {
    model: 'well.model.Leader',
    sorters: [{
      property:'score',
      direction:'DESC'
    }],
    proxy: {
      type: 'ajax',
      url : '/well/leader',
      reader: {
        type: 'json',
        rootProperty: 'teams'
      }
    }
  }
});

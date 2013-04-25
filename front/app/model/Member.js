Ext.define('well.model.Member', {
  extend: 'Ext.data.Model',
  config: {
    fields: [
      {name:'name',type:'string'},
      {name:'nick',type:'string'},
      {name:'well',type:'string'},
      {name:'avatar',type:'string'},
    ]
  },
})

Ext.define('well.store.Team', {
  extend: 'Ext.data.Store',
  
  initialize: function() {
    console.log('TS init')
  },

  config: {
    model: 'well.model.Member',
    sorters: 'name',
    /*
     grouper : function(record) {
     return record.get('lastName')[0];
     },
     */

    proxy: {
      type: 'ajax',
//      url : '/well/getteam',
      reader: {
        type: 'json',
        //            rootProperty: 'users'
      }
    }
  }

  /*

   data: [
   { name: "George", nick: "Washington" },
   { name: "John", nick: "Adams" },
   { name: "Thomas", nick: "Jefferson" },
   { name: "James", nick: "Madison" },
   { name: "James", nick: "Monroe" },
   { name: "John", nick: "Quincy Adams" },
   { name: "Andrew", nick: "Jackson" },
   { name: "Martin", nick: "Van Buren" },
   { name: "William", nick: "Henry Harrison" },
   { name: "John", nick: "Tyler" },
   { name: "James", middleInitial: "K", nick: "Polk" },
   { name: "Zachary", nick: "Taylor" },
   { name: "Millard", nick: "Fillmore" },
   { name: "Franklin", nick: "Pierce" },
   { name: "James", nick: "Buchanan" },
   { name: "Abraham", nick: "Lincoln" },
   { name: "Andrew", nick: "Johnson" },
   { name: "Ulysses", middleInitial: "S", nick: "Grant" },
   { name: "Rutherford", middleInitial: "B", nick: "Hayes" },
   { name: "James", middleInitial: "A", nick: "Garfield" },
   { name: "Chester", nick: "Arthur" },
   { name: "Grover", nick: "Cleveland" },
   { name: "Benjamin", nick: "Harrison" },
   { name: "William", nick: "McKinley" },
   { name: "Theodore", nick: "Roosevelt" },
   { name: "William", nick: "Howard Taft" },
   { name: "Woodrow", nick: "Wilson" },
   { name: "Warren", middleInitial: "G", nick: "Harding" },
   { name: "Calvin", nick: "Coolidge" },
   { name: "Herbert", nick: "Hoover" },
   { name: "Franklin", middleInitial: "D", nick: "Roosevelt" },
   { name: "Harry", middleInitial: "S", nick: "Truman" },
   { name: "Dwight", middleInitial: "D", nick: "Eisenhower" },
   { name: "John", middleInitial: "F", nick: "Kennedy" },
   { name: "Lyndon", middleInitial: "B", nick: "Johnson" },
   { name: "Richard", nick: "Nixon" },
   { name: "Gerald", nick: "Ford" },
   { name: "Jimmy", nick: "Carter" },
   { name: "Ronald", nick: "Reagan" },
   { name: "George", nick: "Bush" },
   { name: "Bill", nick: "Clinton" },
   { name: "George", middleInitial: "W", nick: "Bush" },
   { name: "Barack", nick: "Obama" }
   ]
   }

   */


});

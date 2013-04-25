/*
 This file is generated and updated by Sencha Cmd. You can edit this file as
 needed for your application, but these edits will have to be merged by
 Sencha Cmd when it performs code generation tasks such as generating new
 models, controllers or views and when running "sencha app upgrade".

 Ideally changes to this file would be limited and most work would be done
 in other places (such as Controllers). If Sencha Cmd cannot merge your
 changes and its generated code, it will produce a "merge conflict" that you
 will need to resolve manually.
 */

// DO NOT DELETE - this directive is required for Sencha Cmd packages to work.
//@require @packageOverrides

//<debug>
Ext.Loader.setPath({
  'Ext': 'touch/src',
  'well': 'app'
});
//</debug>

Ext.application({
  name: 'well',

  requires: [
  ],

  views: [
    'Login',
    'Main',
  ],


  controllers: [
    'Main',
    'Connect',
    'Login',
  ],


  models: ['Member','Leader'],

  stores: ['Team','Leader'],


  viewport: {
    autoMaximize: true
  },

  icon: {
    '57': 'resources/icons/Icon.png',
    '72': 'resources/icons/Icon~ipad.png',
    '114': 'resources/icons/Icon@2x.png',
    '144': 'resources/icons/Icon~ipad@2x.png'
  },

  isIconPrecomposed: true,

  startupImage: {
    '320x460': 'resources/startup/320x460.jpg',
    '640x920': 'resources/startup/640x920.png',
    '768x1004': 'resources/startup/768x1004.png',
    '748x1024': 'resources/startup/748x1024.png',
    '1536x2008': 'resources/startup/1536x2008.png',
    '1496x2048': 'resources/startup/1496x2048.png'
  },

  launch: function() {
    console.log('LAUNCH')

    Ext.Viewport.add([
      { xtype: 'welllogin' },
      //      { xtype: 'wellmain' }
    ])


    window.app = {
      suitindex:{
        spades:0,clubs:1,hearts:2,diams:3,
        0:'spades',1:'clubs',2:'hearts',3:'diams'
      },
      numberindex:{
        'num-A':0,
        'num-2':1,
        'num-3':2,
        'num-4':3,
        'num-5':4,
        'num-6':5,
        'num-7':6,
        'num-8':7,
        'num-9':8,
        'num-10':9,
        'num-J':10,
        'num-Q':11,
        'num-K':12,
        0:'num-A',
        1:'num-2',
        2:'num-3',
        3:'num-4',
        4:'num-5',
        5:'num-6',
        6:'num-7',
        7:'num-8',
        8:'num-9',
        9:'num-10',
        10:'num-J',
        11:'num-Q',
        12:'num-K',
      },
      reversecard:function(card){
        return {
          suit:Math.floor(card/13),
          number:card % 13
        }
      },

      loadingIntervals: {},

      stopLoading: function(kind) {
        clearInterval(app.loadingIntervals[kind])
      },

      startLoading: function(kind,store) {
        app.loadingIntervals[kind] = setInterval(function(){
          store.load(function(){})
        },10000)
      },

      upperFirst: function(str) {
        return 0<str.length?str.substring(0,1).toUpperCase()+str.substring(1):str
      }
    }

  },

  onUpdated: function() {
    Ext.Msg.confirm(
      "Application Update",
      "This application has just successfully been updated to the latest version. Reload now?",
      function(buttonId) {
        if (buttonId === 'yes') {
          window.location.reload();
        }
      }
    );
  }
});




// rename to config.mine.js to run app

module.exports = {
  main: {
    port:3333,
    public:'/front'

    // use this for production
    // run these commands to build: cd front; sencha app build production
    //public:'/front/build/well/production'
  },

  // mongodb connection parameters
  'mongo-store':{
    user:'well', // create this user in your mongo database
    pass:'your-password',
    host:'your.mongo.host',
    port:10084,
    name:'well'
  },

  // seneca auth plugin configuration
  auth: {
    redirect: {
      login: {
        // if login is successfull, redirect here
        win:'#main',
      }
    },

    // you must be logged in to access this URL pattern
    restrict:'contains:/player/',

    // twitter oauth configuration
    service: {
      twitter: {

        // change this to your live server when you deploy
        urlhost:'http://localhost:3333',

        key: 'your-twitter-app-key',
        secret: 'your-twitter-app-secret'
      }
    }
  },

  well:{
    // test configuration for development testing
    // mem-store database needs to be recreated each time
    dev_setup: {
      users:{ 
        count: 16 
      },
      events:{
        MeetupA:{numteams:1,code:'ma',host:'meetupa.local:3333'},
        MeetupB:{numteams:2,code:'mb',host:'meetupb.local:3333'},
        MeetupC:{numteams:4,code:'mc',host:'meetupc.local:3333'}
      }
    }
  }
}

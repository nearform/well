# Well!

This is a simple meetup networking game implemented as a mobile web app. It's purpose is to show you an example of a "real" app, built with Node.js, Sencha Touch, and Seneca. That means it has non-trivial functionality, and there are some warts and hacks. This lets you decide for yourself if this set of tools is right for you.

You are also free to cut-and-paste the code base (it's MIT licensed) and use it as a template for your own projects. 


## The Game

You login to the game with Twitter, and then you are assigned a random team. You have to connect with everyone in your team by meeting them in person. Everytime you connect with a fellow team member, your team gets a point. Your team wins if you have the most points are the end of the meetup. 

When you meet someone new, you say 'Well!', and then they know you are in the game. (Actually, you only need to do this if you are in my hometown of Waterford, Ireland, where it's normal behaviour). 

How do you prove you've actually met a team member? Everybody also gets assigned a random playing card. Tap this into the app for the person you just met, and you're connected! You'll find all your team members under the Team tab in the app, so that's the place to start.


## Implementation

The game is implemented as a mobile web app. This keeps things nice and simple as there is no hardware element to worry about, and you can develop and test on desktop web browsers.


## Support

If you're using this example code, feel free to contact me on twitter if you
have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

Current Version: 0.2.1

Tested on: Node 0.10.6, 0.8.7, Seneca 0.5.9




## Install

Fork, clone, or download the code base from Github. Then

```sh
npm install
```

to get modules you need.


## Running

Copy the config.example.js file to config.mine.js.

First run with:

```sh
node app.js --env=development --seneca.log=plugin:well
```

This will create a set of fake users and events that you can play around with.

Then setup a mongodb database, and enter the configuration into the config.mine.js file.

Create some permanent events using the create-event.js script:


```sh
node create-event.js --name=MyEvent --code=event01 --numteams=2
```

## Development

To run the app in development mode, use the --dev option. This means that the app will use the Seneca mem-store plugin for data storage. This is a transient in-memory database, so you can start with a clean data set for each test run.


module.exports = {
  res: {
    base: "../base",
    gen: "../public"
  },

  conf: {},
   
  steps: [

    { name: "fork", 
      forks: [ 
        { name:"ios", conf: {}},
        { name:"android", conf: {}}
      ]
    },

/*
    { name:'import', path:'img/*.png' },
    { name:'import', path:'img-${name}/*.*', save:'img/${gen.resource.name}' },

    { name:'import', path:'css/*.css', exclude:'css/style-*.css' },
    { name:'template', path:'css/style-${name}.css', save:'css/style.css' },
    { name:'template', path:'css/app-${name}.css', save:'css/app-platform.css' },
*/

    { name:'import', path:'js/*.js', exclude:'js/app-*.js' },
    { name:'concat', paths:[
      'js/app-head.js',
      'js/app-${name}.js',
      'js/app-foot.js'
    ], save:'js/app.js' },

    { name:'import', path:'js/test-bundle.js' },

    { name:'template', path:'index.html' },
  ]
}


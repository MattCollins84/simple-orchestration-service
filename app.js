const express = require('express'),
      cors = require('cors'),
      cfenv = require('cfenv'),
      appEnv = cfenv.getAppEnv(),
      credentials = require('./lib/credentials.js').getCredentials(/Etcd by Compose/).url,
      isloggedin = require('./lib/isloggedin.js'),
      compression = require('compression'),
      namespace = require('./lib/namespace.js'),
      service = require('./lib/service.js'),
      _ = require('underscore'),
      liveService = require('./lib/live-service.js'),
      missing = require('./lib/utility.js').missing,
      handleRes = require('./lib/utility.js').handleRes,
      etcd  = require('./lib/etcd.js')

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

io.on("connection", function() {
  console.log("IO connected");
})

// Use Passport to provide basic HTTP auth when locked down
const passport = require('passport');
passport.use(isloggedin.passportStrategy());

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// posted body parser
const bodyParser = require('body-parser')({extended:true})

// compress all requests
app.use(compression());

// set the view engine to ejs
app.set('view engine', 'ejs');

// watch all changes from /root upwards
var watcher = etcd.watcher("/root", null, { recursive: true })
watcher
.on("change", function(data) {
  
  if (_.isObject(data) && _.isObject(data.node) && data.node.key) {

    var key = data.node.key

    // /root/:namespace/services/:servicename
    console.log(key)
    if (key.match(/^\/root\/[a-z0-9-]+$/i)) {
      console.log("namespace only")
    }

    else if (key.match(/^\/root\/[a-z0-9-]+\/services\/[a-z0-9-]+$/i)) {
      
      var bits = key.split("/");
      var nspace = bits[2];
      var sname = bits[4];

      var emitKeys = [`${nspace}-services`, `${nspace}-${sname}`]

      console.log(emitKeys);


    }
    //io.emit('change', data);

  }
  
})

/*******
  UI
  Everything Below here is the HTML UI
*******/

// Homepage - list namespaces
app.get('/', isloggedin.auth, function (req, res) {
  
  namespace.list(function(err, data) {

    console.log(JSON.stringify(data, null, 2))

    if (err) {
      res.status(404);
      return res.render('index', {
        success: false,
        data: []
      })
    }

    return res.render('index', {
      success: true,
      data: data
    })

  })

});

// Index of a particular Namespace
app.get('/index/:namespace', isloggedin.auth, function (req, res) {
  
  namespace.get(req.params.namespace, function(err, data) {

    if (err) {
      res.status(404);
      return res.render('namespace', {
        success: false,
        namespace: req.params.namespace,
        data: []
      })
    }

    return res.render('namespace', {
      success: true,
      namespace: req.params.namespace,
      data: data
    })

  })

});

// Index of services in a particular Namespace
app.get('/index/:namespace/services', isloggedin.auth, function (req, res) {
  
  service.list(req.params.namespace, function(err, data) {

    if (err) {
      res.status(404);
      return res.render('namespace-services', {
        success: false,
        namespace: req.params.namespace,
        data: []
      })
    }
    console.log(data);
    return res.render('namespace-services', {
      success: true,
      namespace: req.params.namespace,
      data: data
    })

  })

});

// Index of live services in a particular Namespace
app.get('/index/:namespace/live-services', isloggedin.auth, function (req, res) {
  
  liveService.list(req.params.namespace, function(err, data) {

    if (err) {
      res.status(404);
      return res.render('namespace-live-services', {
        success: false,
        namespace: req.params.namespace,
        data: []
      })
    }
    console.log(data);
    return res.render('namespace-live-services', {
      success: true,
      namespace: req.params.namespace,
      data: data
    })

  })

});

/*****
  API
  Endpoints below here are the JSON API
*****/

// authenticate
app.get('/authenticate', isloggedin.auth, function (req, res) {
  res.send({url: credentials});
});

// get all namespaces
app.get('/namespace', function(req, res) {

  namespace.list(function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// create namespace
app.post('/namespace/:name', function(req, res) {

  namespace.create(req.params.name, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// get namespace
app.get('/namespace/:name', function(req, res) {

  namespace.get(req.params.name, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// get namespace
app.delete('/namespace/:name', function(req, res) {

  namespace.delete(req.params.name, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// create service in a namespace
app.post('/:namespace/service', bodyParser, function(req, res) {

  var errors = missing(req.body, ["_name", "_type"], true);

  if (errors.length) {
    return res.status(404).send({
      success: false, 
      error: { 
        error: { 
          message: errors.join(", ") 
        }
      }
    })
  }

  service.create(req.params.namespace, req.body._name, req.body, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// get all services for a namespace
app.get('/:namespace/services', function(req, res) {

  service.list(req.params.namespace, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// get specific service for a namespace
app.get('/:namespace/services/:name', function(req, res) {

  service.get(req.params.namespace, req.params.name, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// delete specific service for a namespace
app.delete('/:namespace/services/:name', function(req, res) {

  service.delete(req.params.namespace, req.params.name, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// get all live services for a namespace
app.get('/:namespace/live-services', function(req, res) {

  liveService.list(req.params.namespace, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// get specific live service for a namespace
app.get('/:namespace/live-services/:type', function(req, res) {

  liveService.get(req.params.namespace, req.params.type, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// delete specific live service for a namespace
app.delete('/:namespace/live-services/:type', function(req, res) {

  liveService.delete(req.params.namespace, req.params.type, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// start server on the specified port and binding host
http.listen(appEnv.port, appEnv.bind, function() {

  // print a message when the server starts listening
  console.log("Server starting on " + appEnv.url);

});

require("cf-deployment-tracker-client").track();
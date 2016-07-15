const express = require('express'),
      cors = require('cors'),
      cfenv = require('cfenv'),
      appEnv = cfenv.getAppEnv(),
      credentials = require('./lib/credentials.js').getCredentials(/Etcd by Compose/).url,
      isloggedin = require('./lib/isloggedin.js'),
      compression = require('compression'),
      namespace = require('./lib/namespace.js'),
      service = require('./lib/service.js'),
      env = require('./lib/env.js'),
      _ = require('underscore'),
      missing = require('./lib/utility.js').missing,
      handleRes = require('./lib/utility.js').handleRes,
      etcd  = require('./lib/etcd.js')

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// io.on("connection", function() {
//   console.log("IO connected");
// })

// Use Passport to provide basic HTTP auth when locked down
const passport = require('passport');
passport.use(isloggedin.passportStrategy());

// posted body parser
const bodyParser = require('body-parser')({extended:true})

// compress all requests
app.use(compression());

// watch all changes from /root upwards
var watcher = etcd.watcher("/root", null, { recursive: true })
watcher
.on("change", function(data) {
  console.log(data);
  // if we have a key
  if (_.isObject(data) && _.isObject(data.node) && data.node.key) {

    var key = data.node.key;
    var emitKeys = ["index"];

    // key = /root/:nspace OR /root/:nspace/:something
    if (key.match(/^\/root\/[a-z0-9-_]+$/i) || key.match(/^\/root\/[a-z0-9-_]+\/[a-z0-9-_]+$/i)) {
      
      var bits = key.split("/");
      var nspace = bits[2];

      if (data.action == "delete") {
        emitKeys = emitKeys.concat([`${nspace}-services`, `${nspace}-env`]);
      }

      emitKeys = emitKeys.concat([`${nspace}`]);

    }

    // key = /root/:nspace/services/:sname
    else if (key.match(/^\/root\/[a-z0-9-_]+\/services\/[a-z0-9-_]+$/i)) {
      
      var bits = key.split("/");
      var nspace = bits[2];
      var sname = bits[4];

      emitKeys = emitKeys.concat([`${nspace}`, `${nspace}-services`, `${nspace}-services-${sname}`])

    }

    // key = /root/:nspace/services/:sname
    else if (key.match(/^\/root\/[a-z0-9-_]+\/env\/[a-z0-9-_]+$/i)) {
      
      var bits = key.split("/");
      var nspace = bits[2];
      var sname = bits[4];

      emitKeys = emitKeys.concat([`${nspace}`, `${nspace}-env`])

    }

    console.log(emitKeys);

    // emit to the required keys
    emitKeys.forEach(ek => {
      io.emit(ek);
    })

  }
  
})

/*******
  UI
  Everything Below here is the HTML UI
*******/

// Homepage - list namespaces
app.get('/', isloggedin.auth, function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// Index of a particular Namespace
app.get('/index/:namespace', isloggedin.auth, function (req, res) {
  res.sendFile(__dirname + '/public/index-namespace.html');
});

// Index of services in a particular Namespace
app.get('/index/:namespace/services', isloggedin.auth, function (req, res) {
  res.sendFile(__dirname + '/public/index-namespace-services.html');
});

// Index of live services in a particular Namespace
app.get('/index/:namespace/services/:servicename', isloggedin.auth, function (req, res) {
  res.sendFile(__dirname + '/public/index-namespace-services-servicename.html');
});

// Index of env variables in a particular Namespace
app.get('/index/:namespace/env', isloggedin.auth, function (req, res) {
  res.sendFile(__dirname + '/public/index-namespace-env.html');
});

/*****
  API
  Endpoints below here are the JSON API
*****/

// get all namespaces
app.get('/namespace', isloggedin.auth, function(req, res) {

  namespace.list(function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// create namespace
app.post('/namespace/:name', isloggedin.auth, function(req, res) {

  namespace.create(req.params.name, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// get specific namespace
app.get('/namespace/:name', isloggedin.auth, function(req, res) {

  namespace.get(req.params.name, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// delete namespace
app.delete('/namespace/:name', isloggedin.auth, function(req, res) {

  namespace.delete(req.params.name, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// get all services for a namespace
app.get('/:namespace/services', isloggedin.auth, function(req, res) {

  service.list(req.params.namespace, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// get specific service for a namespace
app.get('/:namespace/services/:name', isloggedin.auth, function(req, res) {

  service.get(req.params.namespace, req.params.name, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// create /env within a namespace
app.post('/:namespace/env', isloggedin.auth, function(req, res) {

  env.create(req.params.namespace, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// get all /env vars within a namespace
app.get('/:namespace/env', isloggedin.auth, function(req, res) {

  env.list(req.params.namespace, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// set env variable within a namespace
app.post('/:namespace/env/:var', isloggedin.auth, bodyParser, function(req, res) {

  if (_.isUndefined(req.body.value)) {
    return res.status(404).send({success: false, err: { error: "Please provide a value" }});
  }

  env.set(req.params.namespace, req.params.var, req.body.value, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// delete env variable within a namespace
app.delete('/:namespace/env/:var', isloggedin.auth, bodyParser, function(req, res) {

  env.delete(req.params.namespace, req.params.var, function(err, data) {

    return handleRes(err, data, req, res)

  })

});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
http.listen(appEnv.port, appEnv.bind, function() {

  // print a message when the server starts listening
  console.log("Server starting on " + appEnv.url);

});

require("cf-deployment-tracker-client").track();
const credentials = require('./credentials.js').getCredentials(/Etcd by Compose/).url
const argv = require('optimist').argv
const fs = require('fs');
const Etcd = require('node-etcd');

// do we have a certificate that we need to use?
var options = {
	strictSSL: false
}

// Connect!
const etcd = new Etcd(credentials, options);

// Export
module.exports = etcd;
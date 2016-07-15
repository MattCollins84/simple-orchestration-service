const etcd 	= require('./etcd.js');
const _ 	 	= require('underscore');
const parseNodes = require('./etcd-utility.js').parseNodes

const create = function(namespace, callback) {
	
	etcd.mkdir(`/root/${namespace}/env`, null, function(err, data) {

		if (err) return callback(err);

		var nodes = [data.node];

		return callback(null, parseNodes(nodes));

	})

}

const set = function(namespace, name, value, callback) {

	etcd.set(`/root/${namespace}/env/${name}`, value, function(err, data) {

		if (err) return callback(err);

		var nodes = [data.node];

		return callback(null, parseNodes(nodes));

	})

}

const list = function(namespace, callback) {
	
	etcd.get(`/root/${namespace}/env`, { recursive: true }, function (err, data) {

		if (err) return callback(err);

		var services = parseNodes(data.node.nodes, true);

		return callback(null, services);

	});

}

const del = function(namespace, name, callback) {

	etcd.del(`/root/${namespace}/env/${name}`, function(err, data) {

		if (err) return callback(err);

		var nodes = [data.node];

		return callback(null, parseNodes(nodes));

	})

}

module.exports = {
	create: create,
	set: set,
	list: list,
	delete: del
}
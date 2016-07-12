const etcd 	= require('./etcd.js');
const _ 	 	= require('underscore');
const async = require('async');
const parseNodes = require('./etcd-utility.js').parseNodes

const create = function(name, callback) {
	
	etcd.set(`/root/${name}/_default`, null, function(err, data) {

		if (err) return callback(err);

		var nodes = [data.node];

		return callback(null, parseNodes(nodes));

	})

}

const get = function(name, callback) {
	
	etcd.get(`/root/${name}/`, function(err, data) {

		if (err) return callback(err);

		var namespaces = parseNodes(data.node.nodes, true);

		return callback(null, namespaces);

	})

}

const list = function(callback) {
	
	etcd.get(`/root`, { recursive: true }, function (err, data) {

		if (err) return callback(err);

		var namespaces = parseNodes(data.node.nodes, true);

		return callback(null, namespaces);

	});

}

const del = function(name, callback) {
	
	etcd.del(`/root/${name}`, { recursive: true }, function(err, data) {

		if (err) return callback(err);

		var deleted = parseNodes([data.node]);

		return callback(null, deleted);

	})

}

module.exports = {
	create: create,
	get: get,
	delete: del,
	list: list
}
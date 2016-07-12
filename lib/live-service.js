const etcd 	= require('./etcd.js');
const _ 	 	= require('underscore');
const async = require('async');
const parseNodes = require('./etcd-utility.js').parseNodes

const get = function(namespace, type, callback) {
	
	etcd.get(`/root/${namespace}/live-services/${type}`, function(err, data) {

		if (err) return callback(err);

		return callback(null, parseNodes([data.node]));

	})

}

const list = function(namespace, callback) {
	
	etcd.get(`/root/${namespace}/live-services`, { recursive: true }, function (err, data) {

		if (err) return callback(err);

		var services = parseNodes(data.node.nodes, true);

		return callback(null, services);

	});

}

const del = function(namespace, type, callback) {
	
	etcd.del(`/root/${namespace}/live-services/${type}`, function(err, data) {

		if (err) return callback(err);

		return callback(null, parseNodes([data.node]));

	})

}

module.exports = {
	list: list,
	get: get,
	delete: del
}
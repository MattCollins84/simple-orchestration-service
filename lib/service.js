const etcd 	= require('./etcd.js');
const _ 	 	= require('underscore');
const async = require('async');
const parseNodes = require('./etcd-utility.js').parseNodes

const create = function(namespace, name, value, callback) {
	
	name = name.replace(/[^a-zA-Z0-9]{1,}/g, '-');

	var actions = {

		// does this namespace/services exist?
		exists: function(callback) {

			etcd.get(`/root/${namespace}`, function(err, data) {
				return callback(err, data);
			})

		},

		// is there a live service of this type
		alreadyLive: function(callback) {

			etcd.get(`/root/${namespace}/live-services/${value._type}`, function(err, data) {

				// nothing live at the moment
				// mark this service as live
				if (err) {
					value._live = true
				}

				// mark as not live
				else {
					value._live = false
				}

				return callback(null, data);

			})

		},

		// create the service
		services: function(callback) {

			etcd.set(`/root/${namespace}/services/${name}`, JSON.stringify(value), function(err, data) {
				return callback(err, data);
			})

		},

		// make the service live if needs be
		makeLive: function(callback) {

			if (value._live) {

				etcd.set(`/root/${namespace}/live-services/${value._type}`, JSON.stringify(value), function(err, data) {
					return callback(err, data);
				})

			}

			else {
				return setImmediate(callback);
			}

		}

	}

	async.series(actions, function(err, result) {

		if (err) return callback(err);

		return callback(null, parseNodes([result.services.node]));

	})

}

const get = function(namespace, name, callback) {
	
	etcd.get(`/root/${namespace}/services/${name}`, function(err, data) {

		if (err) return callback(err);

		return callback(null, parseNodes([data.node]));

	})

}

const list = function(namespace, callback) {
	
	etcd.get(`/root/${namespace}/services`, { recursive: true }, function (err, data) {

		if (err) return callback(err);

		var services = parseNodes(data.node.nodes, true);

		return callback(null, services);

	});

}

const del = function(namespace, name, callback) {
	
	etcd.del(`/root/${namespace}/services/${name}`, function(err, data) {

		if (err) return callback(err);

		return callback(null, parseNodes([data.node]));

	})

}

module.exports = {
	create: create,
	list: list,
	get: get,
	delete: del
}
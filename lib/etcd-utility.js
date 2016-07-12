const _ = require('underscore');
const parseNodes = function(nodes, recursive) {

	// default recursive value
	if (_.isUndefined(recursive) || !_.isBoolean(recursive)) {
		recursive = false;
	}

	// response array
	var arr = [];

	if (!_.isArray(nodes)) {
		return arr
	}

	// for each Node
	nodes.forEach(n => {

		var value = {};

		// capture the value
		if (!_.isUndefined(n.value)) {

			try {
				value = JSON.parse(n.value)
			} catch(e) {
				value = n.value;
			}

		}
		
		// our response node
		var node = {
			name: n.key.replace(/^\/root/, ''),
			value: value
		}

		// if we want to process recursive, do that
		if (recursive && _.isArray(n.nodes)) {
			node.nodes = parseNodes(n.nodes, true)
		}

		// the final node
		arr.push(node)

	});

	return arr;

}

module.exports = {
	parseNodes: parseNodes
}
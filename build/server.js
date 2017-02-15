'use strict';

var _PullRequest = require('./PullRequest');

var _PullRequest2 = _interopRequireDefault(_PullRequest);

var _Review = require('./Review');

var _Review2 = _interopRequireDefault(_Review);

var _Status = require('./Status');

var _Status2 = _interopRequireDefault(_Status);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Hapi = require('hapi');

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({
	host: '0.0.0.0',
	port: 1312
});

function handleGithubEvent(req, reply) {
	var event = req.headers['x-github-event'];

	if (event === 'pull_request') {
		console.log('got a PR');
		return (0, _PullRequest2.default)(req, reply);
	}

	if (event === 'pull_request_review') {
		console.log('got a review');
		return (0, _Review2.default)(req, reply);
	}

	if (event === 'status') {
		console.log('got a status change');
		return (0, _Status2.default)(req, reply);
	}

	return reply();
}

server.route({
	method: '*',
	path: '/{path*}',
	handler: function handler(request, reply) {
		if (request.headers['x-github-event']) {
			return handleGithubEvent(request, reply);
		}

		console.log('Got it', request.params, request.method);
		return reply('Thanks');
	}
});

// Start the server
server.start(function (err) {
	if (err) {
		throw err;
	}

	console.log('Server running at:', server.info.uri);
});

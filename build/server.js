'use strict';

var _hapi = require('hapi');

var _hapi2 = _interopRequireDefault(_hapi);

var _PullRequest = require('./PullRequest');

var _PullRequest2 = _interopRequireDefault(_PullRequest);

var _Review = require('./Review');

var _Review2 = _interopRequireDefault(_Review);

var _Status = require('./Status');

var _Status2 = _interopRequireDefault(_Status);

var _CheckReviewers = require('./CheckReviewers');

var _CheckReviewers2 = _interopRequireDefault(_CheckReviewers);

var _firebase = require('./firebase');

var _firebase2 = _interopRequireDefault(_firebase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import request from 'request'
// import { constructPost } from './utils'

// Create a server with a host and port
var server = new _hapi2.default.Server();
server.connection({
	host: '0.0.0.0',
	port: 1312
});

function handleGithubEvent(req, reply) {
	var repo = req.payload.repository.full_name;
	var event = req.headers['x-github-event'];
	var action = req.payload.action;

	var response = void 0;

	if (event === 'pull_request' || event === 'pull_request_review') {
		// Doesn't reply because we don't want to call it twice.
		(0, _CheckReviewers2.default)(req, event);
	}

	if (event === 'pull_request') {
		console.log('got a PR');
		response = (0, _PullRequest2.default)(req, reply);
	}

	if (event === 'pull_request_review') {
		console.log('got a review');
		response = (0, _Review2.default)(req, reply);
	}

	if (event === 'status') {
		console.log('got a status change');
		response = (0, _Status2.default)(req, reply);
	}

	_firebase2.default.log('github', repo, event, action, req.payload);
	return response || reply();
}

server.route({
	method: 'GET',
	path: '/admin/{path*}',
	handler: function handler(request, reply) {
		console.log('Admin', request.params, request.method);
		return reply('Admin front');
	}
});

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

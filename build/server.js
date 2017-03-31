

const _hapi = require('hapi')

const _hapi2 = _interopRequireDefault(_hapi)

const _CheckReviewers = require('./CheckReviewers')

const _CheckReviewers2 = _interopRequireDefault(_CheckReviewers)

const _PullRequest = require('./PullRequest')

const _PullRequest2 = _interopRequireDefault(_PullRequest)

const _Review = require('./Review')

const _Review2 = _interopRequireDefault(_Review)

const _Status = require('./Status')

const _Status2 = _interopRequireDefault(_Status)

const _Jira = require('./Jira')

const _Jira2 = _interopRequireDefault(_Jira)

const _firebase = require('./firebase')

const _firebase2 = _interopRequireDefault(_firebase)

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj } }

// Create a server with a host and port
const server = new _hapi2.default.Server()
server.connection({
	host: '0.0.0.0',
	port: 1312,
})

function handleGithubEvent(req, reply) {
	const repo = req.payload.repository.full_name
	const event = req.headers['x-github-event']
	const action = req.payload.action

	let response = 'No handling needed'

	if (event === 'pull_request' || event === 'pull_request_review') {
		// Doesn't reply because we don't want to call it twice.
		(0, _CheckReviewers2.default)(req, event)
	}

	if (event === 'pull_request') {
		console.log('got a PR')
		response = (0, _PullRequest2.default)(req, reply)
	}

	if (event === 'pull_request_review') {
		console.log('got a review')
		response = (0, _Review2.default)(req, reply)
	}

	if (event === 'status') {
		console.log('got a status change')
		response = (0, _Status2.default)(req, reply)
	}

	_firebase2.default.log('github', repo, event, action, req.payload)
	return reply(response)
}

server.route({
	method: 'GET',
	path: '/admin/{path*}',
	handler: function handler(request, reply) {
		console.log('Admin', request.params, request.method)
		return reply('Admin front')
	},
})

server.route({
	method: '*',
	path: '/{path*}',
	handler: function handler(request, reply) {
		if (request.headers['x-github-event']) {
			return handleGithubEvent(request, reply)
		}

		if (request.payload && request.payload.transition) {
			return reply(_Jira2.default.handleTransition(request))
		}

		console.log('Got it', request.params, request.method)
		return reply('Thanks')
	},
})

// Start the server
server.start((err) => {
	if (err) {
		throw err
	}

	console.log('Server running at:', server.info.uri)
})

import { PullRequest } from './PullRequest'
import { Review } from './Review'

const Hapi = require('hapi')

// Create a server with a host and port
const server = new Hapi.Server()
server.connection({
	host: 'localhost',
	port: 1312,
})

function handleGithubEvent(req, reply) {
	const event = req.headers['x-github-event']

	if (event === 'pull_request') {
		console.log('got a PR')
		return PullRequest(req, reply)
	}

	if (event === 'pull_request_review') {
		console.log('got a review')
		return Review(req, reply)
	}

	return reply()
}

server.route({
	method: '*',
	path: '/{path*}',
	handler: (request, reply) => {
		if (request.headers['x-github-event']) {
			return handleGithubEvent(request, reply)
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

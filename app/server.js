import Hapi from 'hapi'

import PullRequest from './PullRequest'
import Review from './Review'
import Status from './Status'
import firebase from './firebase'

// Create a server with a host and port
const server = new Hapi.Server()
server.connection({
	host: 'localhost',
	port: 1312,
})

function handleGithubEvent(req, reply) {
	const repo = req.payload.repository.full_name
	const event = req.headers['x-github-event']
	const action = req.payload.action

	firebase.log('github', repo, event, action, req.payload)

	if (event === 'pull_request') {
		console.log('got a PR')
		return PullRequest(req, reply)
	}

	if (event === 'pull_request_review') {
		console.log('got a review')
		return Review(req, reply)
	}

	if (event === 'status') {
		console.log('got a status change')
		return Status(req, reply)
	}

	return reply()
}

server.route({
	method: 'GET',
	path: '/admin/{path*}',
	handler: (request, reply) => {
		console.log('Admin', request.params, request.method)
		return reply('Admin front')
	},
})

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

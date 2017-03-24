import Hapi from 'hapi'

import CheckReviewers from './CheckReviewers'
import PullRequest from './PullRequest'
import Review from './Review'
import Status from './Status'
import Jira from './Jira'
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

	let response = 'No handling needed'

	if (
		event === 'pull_request' ||
		event === 'pull_request_review'
	) {
		// Doesn't reply because we don't want to call it twice.
		CheckReviewers(req, event)
	}

	if (event === 'pull_request') {
		console.log('got a PR')
		response = PullRequest(req, reply)
	}

	if (event === 'pull_request_review') {
		console.log('got a review')
		response = Review(req, reply)
	}

	if (event === 'status') {
		console.log('got a status change')
		response = Status(req, reply)
	}

	firebase.log('github', repo, event, action, req.payload)
	return reply(response)
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

		if (request.payload && request.payload.transition) {
			return reply(Jira.handleTransition(request))
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

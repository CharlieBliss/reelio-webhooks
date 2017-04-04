import Hapi from 'hapi'
import { get } from 'lodash'

import CheckReviewers from './CheckReviewers'
import PullRequest from './PullRequest'
import Review from './Review'
import Status from './Status'
import Jira from './Jira'
import firebase from './firebase'

import config from '../config.json'


// Create a server with a host and port
const server = new Hapi.Server()
server.connection({
	host: 'localhost',
	port: 1312,
})

function handleGithubEvent(req, reply) {
	const fullRepo = req.payload.repository.full_name,
		org = fullRepo.split('/')[0],
		repo = fullRepo.split('/')[1]

	const event = req.headers['x-github-event']
	const action = req.payload.action

	let response = 'No handling needed'

	if (
		event === 'pull_request' ||
		event === 'pull_request_review'
	) {
		// Doesn't reply because we don't want to call it twice.
		if (get(config, [org, repo, 'require_reviews', 'enabled'])) {
			CheckReviewers(req, event, get(config, [org, repo, 'require_reviews', 'count']))
		}
	}

	if (event === 'pull_request') {
		console.log('got a PR')

		if (get(config, [org, repo, 'pull_request', 'enabled'])) {
			response = PullRequest(req, reply)
		}
	}

	if (event === 'pull_request_review') {
		console.log('got a review')

		if (get(config, [org, repo, 'pull_request_review', 'enabled'])) {
			response = Review(req, reply)
		}
	}

	if (event === 'status') {
		console.log('got a status change')

		response = Status(req, reply, config, org, repo)
	}

	firebase.log('github', fullRepo, event, action, req.payload)
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

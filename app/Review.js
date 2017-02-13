import { constructDelete, constructPost } from './utils.js'

const request = require('request')

function handleRequestedChanges(payload, reply) {
	request(constructPost(`${payload.pull_request.issue_url}/labels`), ['changes requested'])
	request(constructDelete(`${payload.pull_request.issue_url}/labels/ready%20to%20review`))
	request(constructDelete(`${payload.pull_request.issue_url}/labels/approved`))

	// @TODO add slackbot that slacks a link to the PR to the person who opened the PR

	return reply('Review Changes Success')
}

function handleApproved(payload, reply) {
	request(constructPost(`${payload.pull_request.issue_url}/labels`), ['approved'])
	request(constructDelete(`${payload.pull_request.issue_url}/labels/ready%20to%20review`))
	request(constructDelete(`${payload.pull_request.issue_url}/labels/changes%20requested`))

	return reply('Review Changes Success')
}

function Review(req, reply) {
	const payload = req.payload

	if (payload.review.state === 'changes_requested') {
		return handleRequestedChanges(payload, reply)
	}

	if (payload.review.state === 'approved') {
		return handleApproved(payload, reply)
	}

	return reply('Review Success')
}

export default Review

import { constructDelete, constructPost } from './utils.js'

const request = require('request')

function handleError(payload, reply) {
	request(constructPost(`${payload.pull_request.issue_url}/labels`), ['failed ci'])
	request(constructDelete(`${payload.pull_request.issue_url}/labels/ready%20to%20review`))

	// @TODO add slackbot that slacks a link to the PR to the person who opened the PR

	return reply('CI Status fail')
}

function handleSuccess(payload, reply) {
	request(constructDelete(`${payload.pull_request.issue_url}/labels/failed%20ci`))
	request(constructPost(`${payload.pull_request.issue_url}/labels`), ['approved'])

	return reply('CI Status succeed')
}

function Review(req, reply) {
	const payload = req.payload

	if (payload.state === 'failure') {
		return handleError(payload, reply)
	}

	if (payload.state === 'success') {
		return handleSuccess(payload, reply)
	}

	return reply('Review Success')
}

export default Review

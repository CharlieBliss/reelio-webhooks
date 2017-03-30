import { constructDelete, constructPost } from './utils'
import { SLACK_URL, FRONTEND_MEMBERS } from './consts'

const request = require('request')

function handleRequestedChanges(payload) {
	const user = FRONTEND_MEMBERS[payload.pull_request.user.id]

	request(constructPost(`${payload.pull_request.issue_url}/labels`, ['changes requested']))
	request(constructDelete(`${payload.pull_request.issue_url}/labels/ready%20to%20review`))

	if (user) {
		request(constructPost(SLACK_URL, {
			channel: user.slack_id,
			username: 'PR Bot',
			icon_url: 'https://octodex.github.com/images/luchadortocat.png',
			text: `Hey there, ${user.name}.  Your pull request was flagged for changes.  Please review on <${payload.review.html_url}|GitHub>.`,
		}))
	}

	return 'Review Changes Request'
}

function handleApproved(payload) {
	request(constructDelete(`${payload.pull_request.issue_url}/labels/changes%20requested`))

	return 'Review Changes Success'
}

function Review(req, reply) {
	const payload = req.payload

	if (payload.review.state === 'changes_requested') {
		return handleRequestedChanges(payload, reply)
	}

	if (payload.review.state === 'approved') {
		return handleApproved(payload, reply)
	}

	return 'Review Success'
}

export default Review

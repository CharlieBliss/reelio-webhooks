import { FRONTEND_MEMBERS } from './consts'
import { constructGet, constructPost, constructDelete, parseReviews } from './utils'
import Slack from './Slack'

const request = require('request')

function triggerReviewReminder(user, payload) {
	request(constructGet(`${payload.pull_request.url}/reviews`), (err, res, body) => {
		let reviews
		if (res.statusCode >= 200 && res.statusCode < 300) {
			reviews = JSON.parse(body) || []
		}

		// get reviewers and send a reminder message for each of them to re-review
		const reviewers = parseReviews(reviews)
		reviewers.map((reviewer) => {
			Slack('review reminder', payload, user, null, null, reviewer)
			return 'Reviewer Reminded'
		})
	})
}

function handleAddLabel(payload) {
	if (payload.label.name === 'WIP') {
		request(constructDelete(`${payload.pull_request.issue_url}/labels/$$review`))
		request(constructDelete(`${payload.pull_request.issue_url}/labels/ready%20to%20review`))
	}
}

function handleUnlabel(payload) {
	const user = FRONTEND_MEMBERS[payload.pull_request.user.id]

	if (payload.label.name === 'changes requested') {
		triggerReviewReminder(user, payload)
	}

	if (payload.label.name === 'WIP') {
		request(constructPost(`${payload.pull_request.issue_url}/labels`, ['$$review', 'ready to review']))
	}
}

function Labels(payload) {
	if (payload.action === 'labeled') {
		return handleAddLabel(payload)
	}

	if (payload.action === 'unlabeled') {
		return handleUnlabel(payload)
	}

	return 'Got a label change'
}

export default Labels

import request from 'request'
import { FRONTEND_MEMBERS } from '../../consts'
import Github from '../../helpers/github'
import Slack from '../../helpers/slack'


/**
 * If a PR gets changes requested, put a label on the PR and slack the author to take a look.
 */
function handleRequestedChanges(payload) {
	const user = FRONTEND_MEMBERS[payload.pull_request.user.id]

	request(Github.post(`${payload.pull_request.issue_url}/labels`, ['changes requested']))

	if (user) {
		Slack.changesRequested(payload, user)
	}

	return 'Review Changes Request'
}

function handleApproved() {
	return 'Review Changes Success'
}

function Review(payload) {
	if (payload.review.state === 'changes_requested') {
		return handleRequestedChanges(payload)
	}

	if (payload.review.state === 'approved') {
		return handleApproved(payload)
	}
}

export default Review

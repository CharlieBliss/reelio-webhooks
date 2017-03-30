import { FRONTEND_MEMBERS } from './consts'
import Slack from './Slack'

// This component can't easily link to PRs because statuses are for specific commits, not PRs

function handleError(payload) {
	const user = FRONTEND_MEMBERS[payload.commit.author.id]
	if (user) {
		Slack.slackCircleFailure(user)
	}

	return 'CI Status fail'
}

function Status(req, reply) {
	const payload = req.payload

	if (payload.state === 'failure' && payload.context === 'ci/circleci') {
		return handleError(payload, reply)
	}

	return 'Status Success'
}

export default Status

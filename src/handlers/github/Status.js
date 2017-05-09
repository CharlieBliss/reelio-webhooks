import { FRONTEND_MEMBERS } from '../../consts'
import Slack from '../../helpers/slack'

// This component can't easily link to PRs because statuses are for specific commits, not PRs

function handleError(payload) {
	const user = FRONTEND_MEMBERS[payload.commit.author.id],
		commit = payload.commit.html_url

	if (user) {
		Slack.slackCircleFailure(user, commit)
	}

	return 'CI Status fail'
}

function Status(payload) {
	if (payload.state === 'failure' && payload.context === 'ci/circleci')	{
		return handleError(payload)
	}

	return 'Status Success'
}

export default Status

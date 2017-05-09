import request from 'request'
import { SLACK_URL, FRONTEND_MEMBERS } from '../consts'

function sendMessage(payload) {
	request({
		url: SLACK_URL,
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(payload),
	})
}

class Slack {
	changesRequested(payload, user) {
		sendMessage({
			channel: user.slack_id,
			username: 'PR Bot',
			icon_url: 'https://octodex.github.com/images/luchadortocat.png',
			text: `Hey there, ${user.name}.  Your pull request was flagged for changes.  Please review on <${payload.review.html_url}|GitHub>.`,
		})
	}

	reviewReminder(payload, user, reviewer) {
		sendMessage({
			channel: FRONTEND_MEMBERS[reviewer.user].slack_id,
			username: 'Review Bot',
			icon_url: 'https://octodex.github.com/images/steroidtocat.png',
			text: `Hi there, ${FRONTEND_MEMBERS[reviewer.user].name}. ${user.name}'s <${payload.pull_request.html_url}|Pull Request> has been updated. Please re-review the PR for approval.`,
		})
	}

	tableFailed(ticket, resp) {
		sendMessage({
			channel: 'U28LB0AAH',
			username: 'PR Bot',
			icon_url: 'https://octodex.github.com/images/yaktocat.png',
			text: `Something went wrong when trying to update the table for: <https://reelio.atlassian.net/browse/${ticket}|${ticket}>.\n\n\`\`\`${resp.errorMessages.join('\n')}\`\`\``,
		})
	}

	noTable(payload) {
		sendMessage({
			channel: 'U28LB0AAH',
			username: 'PR Bot',
			icon_url: 'https://octodex.github.com/images/yaktocat.png',
			text: `There was no table for ticket <https://reelio.atlassian.net/browse/${payload.issue.key}|${payload.issue.key}>`,
		})
	}

	firebaseFailed() {
		sendMessage({
			channel: 'U28LB0AAH',
			username: 'Firebase Bot',
			icon_url: 'https://octodex.github.com/images/yaktocat.png',
			text: 'Something went wrong when trying to trim firebase payload size. Check server logs, scrub',
		})
	}

	slackCircleFailure(user, commit) {
		sendMessage({
			channel: user.slack_id,
			username: 'Circle Bot',
			icon_url: 'https://octodex.github.com/images/socialite.jpg',
			text: `Hey there, ${user.name}.  Your commit did not pass Circle CI's test suite.  Please review on <${commit}|GitHub>.`,
		})
	}

	slackDeployWarning(payload, tickets) {
		const versionText = '<http://pro.reelio.com|production>'
		sendMessage({
			channel: '#frontend-deploys',
			username: 'Deploy Bot',
			icon_url: 'https://octodex.github.com/images/welcometocat.png',
			text: `*A deploy has been made to ${versionText}.*  The changes will be ready in ~15 minutes.\n\nThe deploy is based off of <${payload.pull_request.html_url}|PR ${payload.pull_request.number}>.\n\n*\`-- Fixes --\`*`,
			attachments: [
				{
					text: tickets,
					color: '#36a64f',
				},
				{
					text: versionText,
					color: '#de2656',
				},
			],
		})
	}

	slackCongrats(payload, user) {
		sendMessage({
			channel: user.slack_id,
			username: 'Merge Bot',
			icon_url: 'https://octodex.github.com/images/welcometocat.png',
			text: `:tada::party_parrot::tada:Nice work, ${user.name}!  Your <${payload.pull_request.html_url}|pull request> was merged without needing changes! Keep up the good work! :tada::party_parrot::tada:`,
		})
	}

}

export default new Slack()

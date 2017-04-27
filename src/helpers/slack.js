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
			channel: user.slack_id,
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

		console.log('TICKET TABLE FAILED', resp)
	}

	firebaseFailed(err) {
		sendMessage({
			channel: 'U28LB0AAH',
			username: 'Firebase Bot',
			icon_url: 'https://octodex.github.com/images/yaktocat.png',
			text: 'Something went wrong when trying to trim firebase payload size. Check server logs, scrub',
		})

		console.warn('FIREBASE NO WORK -- ', err)
	}

}

export default new Slack()

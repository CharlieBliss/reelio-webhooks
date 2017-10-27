import { find } from 'lodash'

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

	conflictWarning(payload) {
		const user = FRONTEND_MEMBERS[payload.user.id]
		sendMessage({
			channel: user.slack_id,
			username: 'Conflict Resolution Bot',
			icon_url: 'https://octodex.github.com/images/yaktocat.png',
			text: `Hey there, ${user.name}. PR ${payload.number} has been flagged as having merge conflicts. Please review on <${payload.html_url}|GitHub>.`,
		})
	}

	tableFailed(ticket, resp) {
		sendMessage({
			channel: 'U1QHPGCP2',
			username: 'PR Bot',
			icon_url: 'https://octodex.github.com/images/yaktocat.png',
			text: `Something went wrong when trying to update the table for: <https://reelio.atlassian.net/browse/${ticket}|${ticket}>.\n\n\`\`\`${resp.errorMessages.join('\n')}\`\`\``,
		})
	}

	noTable(payload) {
		sendMessage({
			channel: 'U1QHPGCP2',
			username: 'PR Bot',
			icon_url: 'https://octodex.github.com/images/yaktocat.png',
			text: `There was no table for ticket <https://reelio.atlassian.net/browse/${payload.issue.key}|${payload.issue.key}>`,
		})
	}

	firebaseFailed() {
		sendMessage({
			channel: 'U1QHPGCP2',
			username: 'Firebase Bot',
			icon_url: 'https://octodex.github.com/images/yaktocat.png',
			text: 'Something went wrong when trying to trim firebase payload size. Check server logs, scrub',
		})
	}

	prWarning(head, base, url) {
		sendMessage({
			channel: 'U1QHPGCP2',
			username: 'PR Bot',
			icon_url: 'https://octodex.github.com/images/yaktocat.png',
			text: `Something went wrong when trying to make a pr between ${head} and ${base}.  ${url}`,
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

	slackDeployWarning(payload, tickets, channel, url) {
		if (channel && url) {
			sendMessage({
				channel,
				username: 'Deploy Bot',
				icon_url: 'https://octodex.github.com/images/welcometocat.png',
				text: `*A deploy has been made to ${url}.*  The changes will be ready in ~15 minutes.\n\nThe deploy is based off of <${payload.pull_request.html_url}|PR ${payload.pull_request.number}>.\n\n*\`-- Fixes --\`*`,
				attachments: [
					{
						text: tickets,
						color: '#36a64f',
					},
					{
						text: url,
						color: '#de2656',
					},
				],
			})
		}
	}

	slackCongrats(payload, user) {
		sendMessage({
			channel: user.slack_id,
			username: 'Merge Bot',
			icon_url: 'https://octodex.github.com/images/welcometocat.png',
			text: `:tada::party_parrot::tada:Nice work, ${user.name}!  Your <${payload.pull_request.html_url}|pull request> was merged without needing changes! Keep up the good work! :tada::party_parrot::tada:`,
		})
	}

	alertBranch(ticket, jiraKey) {
		const user = jiraKey ? find(FRONTEND_MEMBERS, { jira_key: jiraKey }) : null

		if (user) {
			sendMessage({
				channel: user.slack_id,
				username: 'Branch Bot',
				icon_url: 'https://octodex.github.com/images/maxtocat.gif',
				text: `Hey there!  A schema branch was created for your ticket, ${ticket}.  You should get started on updating the schema!\n\nTo get started, \`git fetch -a && git checkout schema-${ticket}\`\n\nWhen you push to that branch, a feature-branch and PR will automatically be created.`,
			})
		}
	}

	alertPR(id, head, base, PR) {
		const user = FRONTEND_MEMBERS[id]

		if (user) {
			sendMessage({
				channel: user.slack_id,
				username: 'Branch Bot',
				icon_url: 'https://octodex.github.com/images/maxtocat.gif',
				text: `Hey there!  A PR was created between \`${head}\` and \`${base}\` for you.  You can view it <${PR}|here>!`,
			})
		}
	}

}

export default new Slack()

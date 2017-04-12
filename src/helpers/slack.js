const request = require('request')
const slackConsts = require('../consts/slack')

function Slack() {}

function sendMessage(user, payload) {
	request({
		url: slackConsts.SLACK_URL,
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify(payload),
	})
}

Slack.prototype.changesRequested = (payload, user) => {
	sendMessage({
		channel: user.slack_id,
		username: 'PR Bot',
		icon_url: 'https://octodex.github.com/images/luchadortocat.png',
		text: `Hey there, ${user.name}.  Your pull request was flagged for changes.  Please review on <${payload.review.html_url}|GitHub>.`,
	})
}

module.exports = new Slack()

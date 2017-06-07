import nock from 'nock'

const consts = require('../../src/consts/slack')
const slackUrl = require('../../src/consts/slack').SLACK_URL

export const genericSlack = () => (
	nock(slackUrl)
		.post('')
		.reply(200)
)

const user = consts.FRONTEND_MEMBERS[7416637]
const textRegexp = new RegExp(`^(?=.*\\b${user.name}\\b)(?=.*\\bhttp:\\/\\/reelio\\.com\\b).*$`)

export const changesRequestedSlack = () => (
	nock(consts.SLACK_URL)
		.post('', { channel: user.slack_id, text: textRegexp })
		.reply(200)
)

export const conflictWarningSlack = (pullNumber = 1) => (
	nock(slackUrl)
		.post('',
			{
				channel: user.slack_id,
				username: 'Conflict Resolution Bot',
				icon_url: 'https://octodex.github.com/images/yaktocat.png',
				text: `Hey there, Dillon. PR 123 has been flagged as having merge conflicts. Please review on <https://api.github.com/repos/Kyle-Mendes/public-repo/pulls/${pullNumber}|GitHub>.`,
			}
		)
		.reply(200)
)

export const slackTableFailed = () => (
	nock(consts.SLACK_URL)
		.post('', { channel: 'U28LB0AAH', username: 'PR Bot'})
		.reply(200)
)

export const slackFirebaseFailed = () => (
	nock(consts.SLACK_URL)
		.post('', { channel: 'U28LB0AAH', username: 'Firebase Bot'})
		.reply(200)
)

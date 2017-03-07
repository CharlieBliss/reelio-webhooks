import { constructPost } from './utils'
import firebase from './firebase'
import { SLACK_URL, FRONTEND_MEMBERS } from './consts'

const request = require('request')

// This component can't easily link to PRs because statuses are for specific commits, not PRs

function handleError(payload, reply) {
	const user = FRONTEND_MEMBERS[payload.commit.author.id]
	if (user) {
		request(constructPost(SLACK_URL, {
			channel: user.slack_id,
			username: 'Circle Bot',
			icon_url: 'https://octodex.github.com/images/socialite.jpg',
			text: `Hey there, ${user.name}.  Your commit did not pass Circle CI's test suite.  Please review on <https://github.com/hangarunderground/reelio-front/pulls|GitHub>.`,
		}))
	}

	firebase.log('custom', 'circle', 'status', 'failure', payload)

	return reply('CI Status fail')
}

function Review(req, reply) {
	const payload = req.payload

	if (payload.state === 'failure') {
		return handleError(payload, reply)
	}

	return reply('Review Success')
}

export default Review

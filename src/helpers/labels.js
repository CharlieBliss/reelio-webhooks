import request from 'request'
import { FRONTEND_MEMBERS } from '../consts/slack'
import Github from '../helpers/github'
import Slack from '../helpers/slack'
import { parseReviews } from './utils'

class LabelHelper {

	triggerReviewReminder(payload) {
		const user = FRONTEND_MEMBERS[payload.pull_request.user.id]
		request(Github.get(`${payload.pull_request.url}/reviews`), (err, res, body) => {
			let reviews
			if (res.statusCode >= 200 && res.statusCode < 300) {
				reviews = JSON.parse(body) || []
			}
				// get reviewers and send a reminder message for each of them to re-review
			const reviewers = parseReviews(reviews)
			reviewers.map((reviewer) => {
				Slack.reviewReminder(payload, user, reviewer)
				return 'Reviewer Reminded'
			})
		})
	}

	handleAddLabel(payload) {
		if (payload.label.name === 'WIP') {
			request(Github.delete(`${payload.pull_request.issue_url}/labels/$$review`))
			request(Github.delete(`${payload.pull_request.issue_url}/labels/ready%20to%20review`))
		}
	}

	handleUnlabel(payload) {
		if (payload.label.name === 'changes requested') {
			this.triggerReviewReminder(payload)
		}

		if (payload.label.name === 'WIP') {
			request(Github.post(`${payload.pull_request.issue_url}/labels`, ['$$review', 'ready to review']))
		}
	}
}

export default new LabelHelper()

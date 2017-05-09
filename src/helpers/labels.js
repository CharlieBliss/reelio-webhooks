import request from 'request'
import { FRONTEND_MEMBERS } from '../consts/slack'
import { parseReviews } from './utils'
import Github from '../helpers/github'
import Slack from '../helpers/slack'

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
			reviewers.forEach((reviewer) => {
				Slack.reviewReminder(payload, user, reviewer)
			})

			return 'Labels -- Reviewers Reminded'
		})
	}

	handleAddLabel(payload) {
		if (payload.label.name === 'WIP') {
			request(Github.delete(`${payload.pull_request.issue_url}/labels/$$review`))
		}
	}

	handleUnlabel(payload) {
		if (payload.label.name === 'changes requested') {
			return this.triggerReviewReminder(payload)
		}

		if (payload.label.name === 'WIP') {
			request(Github.post(`${payload.pull_request.issue_url}/labels`, ['$$review']))
		}

		return 'Label -- Unlabeled'
	}
}

export default new LabelHelper()

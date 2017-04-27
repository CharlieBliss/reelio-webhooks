import request from 'request'
import { FRONTEND_MEMBERS } from '../consts/slack'
import Github from '../helpers/github'
import Slack from '../helpers/slack'

class LabelsHelper {
	parseReviews(reviews) {
		// grab the data we care about
		const parsed = reviews.map(r => ({
			state: r.state,
			user: r.user.id,
			submitted: new Date(r.submitted_at),
		}))

		const data = {}

		// group reviews by review author, and only keep the newest review
		parsed.forEach((p) => {
			// we only care about reviews that are approved or denied.
			if (p.state.toLowerCase() !== 'approved' && p.state.toLowerCase() !== 'changes_requested') {
				return
			}

			// Check if the new item was submitted AFTER
			// the already saved review.  If it was, overwrite
			if (data[p.user]) {
				const submitted = data[p.user].submitted
				data[p.user] = submitted > p.submitted ? data[p.user] : p
			} else {
				data[p.user] = p
			}
		})

		return Object.keys(data).map(k => data[k])
	}

	triggerReviewReminder(user, payload) {
		request(Github.get(`${payload.pull_request.url}/reviews`), (err, res, body) => {
			let reviews
			if (res.statusCode >= 200 && res.statusCode < 300) {
				reviews = JSON.parse(body) || []
			}
			// get reviewers and send a reminder message for each of them to re-review
			const reviewers = this.parseReviews(reviews)
			reviewers.map((reviewer) => {
				Slack.slackReviewReminder(payload, user, reviewer)
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
		const user = FRONTEND_MEMBERS[payload.pull_request.user.id]

		if (payload.label.name === 'changes requested') {
			this.triggerReviewReminder(user, payload)
		}

		if (payload.label.name === 'WIP') {
			request(Github.post(`${payload.pull_request.issue_url}/labels`, ['$$review', 'ready to review']))
		}
	}

	Labels(payload) {
		if (payload.action === 'labeled') {
			return this.handleAddLabel(payload)
		}

		if (payload.action === 'unlabeled') {
			return this.handleUnlabel(payload)
		}

		return 'Got a label change'
	}
}

export default LabelsHelper

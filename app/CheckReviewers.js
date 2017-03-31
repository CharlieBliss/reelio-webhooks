import request from 'request'
import Jira from './Jira'
import { jiraRegex } from './consts'
import { constructGet, constructDelete, constructPost, parseReviews } from './utils'

function CheckReviewers(req, event) {
	const payload = req.payload,
		action = payload.action,
		base = payload.pull_request.base.ref,
		author = payload.pull_request.user

	const actions = ['opened', 'edited', 'reopened', 'synchronize']

	// We don't want to run this check on things like PR closed
	if (event === 'pull_request' && !actions.includes(action)) {
		return
	}

	const prUrl = payload.pull_request.url,
		sha = payload.pull_request.head.sha

	// Skip PRs that don't need reviews.
	if (
		base.includes('master') ||
		author.id.toString() === '25992031'
	) {
		request(constructPost(`${payload.repository.url}/statuses/${sha}`, {
			state: 'success',
			description: 'No reviews required',
			context: 'ci/reelio',
		}))

		return 'Master Branch' // eslint-disable-line
	}

	request(constructGet(`${prUrl}/reviews`), (response, errors, body) => {
		let reviews = JSON.parse(body) || [],
			approved = []

		// group by author keep latest
		reviews = parseReviews(reviews)
		approved = reviews
			.map(r => r.state)
			.filter(r => r.toLowerCase() === 'approved')

		if (
			reviews.length > 1 &&
			approved.length > 1
		) {
			if (reviews.length === approved.length) {
				request(constructPost(`${payload.repository.url}/statuses/${sha}`, {
					state: 'success',
					description: 'At least 2 reviews, all reviews approved.',
					context: 'ci/reelio',
				}))
				request(constructPost(`${payload.pull_request.issue_url}/labels`, ['approved', '$$qa']))
				request(constructDelete(`${payload.pull_request.issue_url}/labels/%24%24review`))

				// Move the tickets to "Ready for QA"
				const tickets = payload.pull_request.body.match(jiraRegex) || []
				Jira.transitionTickets(tickets, payload)
			}

			if (reviews.length !== approved.length) {
				request(constructPost(`${payload.repository.url}/statuses/${sha}`, {
					state: 'failure',
					description: 'This PR is blocked from merging due to a pending request for changes.',
					context: 'ci/reelio',
				}))
				request(constructPost(`${payload.pull_request.issue_url}/labels`, ['$$review']))
				request(constructDelete(`${payload.pull_request.issue_url}/labels/approved`))
				request(constructDelete(`${payload.pull_request.issue_url}/labels/%24%24qa`))
			}

		} else {
			request(constructPost(`${payload.repository.url}/statuses/${sha}`, {
				state: 'failure',
				description: `This PR requires ${approved.length === 1 ? 1 : 2} more approved review${approved.length > 1 ? 's' : ''} to be merged.`,
				context: 'ci/reelio',
			}))
			request(constructPost(`${payload.pull_request.issue_url}/labels`, ['$$review']))
			request(constructDelete(`${payload.pull_request.issue_url}/labels/%24%24qa`))
			request(constructDelete(`${payload.pull_request.issue_url}/labels/approved`))

		}
	})
}

export default CheckReviewers

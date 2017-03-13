import request from 'request'
import { constructGet, constructDelete, constructPost } from './utils'

function parseReviews(reviews) {
	// grab the data we care about
	const parsed = reviews.map(r => ({
		state: r.state,
		user: r.user.id,
		submitted: new Date(r.submitted_at),
	}))

	const data = {}

	// group reviews by review author, and only keep the newest review
	parsed.forEach((p) => {
		// Check if the new item was submitted AFTER
		// the already saved review.  If it was, overwrite
		if (data[p.user]) {
			const submitted = data[p.user].submitted
			data[p.user] = submitted > p.submitted ? data[p.user] : p
		} else {
			data[p.user] = p
		}
	})

	return Object.keys(data).map(k => data[k].state)
}

function CheckReviewers(req, event) {
	const payload = req.payload,
		action = payload.action,
		base = payload.pull_request.base.ref,
		author = payload.pull_request.user

	// We don't want to run this check on things like PR closed
	if (
		event === 'pull_request' && (
			action !== 'opened' ||
			action !== 'edited' ||
			action !== 'reopened' ||
			action !== 'synchronize'
		)
	) {
		return
	}

	// Skip PRs that don't need reviews.
	if (
		base.includes('staging') ||
		base.includes('production') ||
		base.includes('master') ||
		author.id.toString() === '25992031'
	) {
		return
	}

	const prUrl = payload.pull_request.url,
		sha = payload.pull_request.head.sha

	request(constructGet(`${prUrl}/reviews`), (response, errors, body) => {
		let reviews = JSON.parse(body)

		// group by author keep latest
		reviews = parseReviews(reviews)
		const approved = reviews.filter(r => r.toLowerCase() === 'approved')
		console.log('reviews', reviews, approved)

		if (
			reviews.length > 1 &&
			approved.length > 1
		) {
			request(constructPost(`${payload.repository.url}/statuses/${sha}`, {
				state: 'success',
				description: 'At least 2 reviewers.',
				context: 'ci/reelio',
			}))
			request(constructPost(`${payload.pull_request.issue_url}/labels`, ['approved']))
			request(constructDelete(`${payload.pull_request.issue_url}/labels/%24%24review`))
		} else {
			request(constructPost(`${payload.repository.url}/statuses/${sha}`, {
				state: 'failure',
				description: `This PR requires ${approved.length === 1 ? 1 : 2} more approved review${approved.length > 1 ? 's' : ''} to be merged.`,
				context: 'ci/reelio',
			}))
			request(constructPost(`${payload.pull_request.issue_url}/labels`, ['$$review']))
			request(constructDelete(`${payload.pull_request.issue_url}/labels/approved`))

		}
	})
}

export default CheckReviewers

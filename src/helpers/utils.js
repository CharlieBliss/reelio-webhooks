import rp from 'request-promise'
import Github from '../helpers/github'
import Slack from '../helpers/slack'
import Jira from '../helpers/tickets'

export function uniqueTicketFilter(value, index, self) {
	return self.indexOf(value) === index
}

export function wrapJiraTicketsFromArray(ticket) {
	return Jira.getJiraSummary(ticket).then(summary => (
		{ ticketNumber: ticket, summary }
	))
}

export function parseReviews(reviews = []) {
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

export function checkSingleMergeStatus(pullRequest) {
	// unstable indicates no merge conflicts but PR status checks are failing
	if (pullRequest.mergeable_state === 'clean' || pullRequest.mergeable_state === 'unstable') {
		rp(Github.delete(`${pullRequest.issue_url}/labels/%24%24rebase`))

	} else if (pullRequest.mergeable_state === 'conflicting' || pullRequest.mergeable_state === 'dirty') {
		rp(Github.post(`${pullRequest.issue_url}/labels`, ['$$rebase']))
		Slack.conflictWarning(pullRequest)

	} else if (pullRequest.mergeable_state === 'unknown') {
		// timeout gives github time to compute mergeability when it's 'unknown'
		setTimeout(() => {
			checkSingleMergeStatus(pullRequest)
		}, 100)
	}
}

export function checkMergeStatus(payload) {
	// get all pulls for repository
	rp(Github.get(`${payload.repository.url}/pulls`)).then((data) => {
		const pullRequests = JSON.parse(data) || []
		// loop over each pull request and checks merge_status
		pullRequests.forEach((pull) => {
			rp(Github.get(pull.url)).then((response) => {
				const pullRequest = JSON.parse(response)
				checkSingleMergeStatus(pullRequest)
			})
		})
	})
}

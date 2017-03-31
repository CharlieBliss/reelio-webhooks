import firebase from './firebase'
import { jiraRegex, FRONTEND_MEMBERS } from './consts'
import { uniqueTicketFilter, wrapJiraTicketsFromArray, constructGet, constructPost, constructPatch } from './utils'

import Slack from './Slack'
import Labels from './Labels'

const request = require('request')

function createPullRequest(head, base, payload, newBody = '', labels = []) {
	// Check if there is a PR between the head and branch already.  If there is, we don't need to make a new PR
	request(constructGet(`${payload.repository.url}/pulls?head=${head}&base=${base}&state=open`), (response, errors, openPRs) => {
		const open = JSON.parse(openPRs)
		if (open.length) {
			// sometimes it returns non-results.
			const realOpen = open.filter(o => o.head.ref === head && o.base.ref === base)
			if (realOpen.length) {
				console.log('SKIPPING PR', head, base, open.map(o => ({ head: o.head.ref, base: o.base.ref })))

				// append the new resolved tickets to the existing PR
				// Assumes that there will only ever be ONE PR returned here...
				const editedBody = realOpen[0].body + newBody.substr(newBody.indexOf('\n'), newBody.length) // append the resolved tickets to the ticket list

				request(constructPatch(realOpen[0].url, { body: editedBody })) // update the body of the old PR
				return
			}
		}

		// create Issue.  To add lables to the PR on creation, it needs to start as an issue
		const issue = {
			title: `${head} --> ${base}`,
			body: `# Merging from branch ${head} into ${base}.\n\n### Previous PR: ${payload.pull_request.html_url}\n\n${newBody}`,
			labels: ['$$webhook', ...labels],
		}

		request(constructPost(`${payload.repository.url}/issues`, issue), (err, res, body) => {
			let resBody = JSON.parse(body)

			// If making the issue fails, slack Kyle
			if (body.errors) {
				Slack.slackErrorWarning(payload, body)
			} else {
				const pr = {
					issue: JSON.parse(body).number,
					head,
					base,
				}

				console.log('PR', pr)

				request(constructPost(`${payload.repository.url}/pulls`, pr), (e, r, b) => {
					console.log('CREATE PR', JSON.parse(b))
					resBody = JSON.parse(b)

					if (e || !resBody.number) {
						Slack.slackErrorWarning(payload, body)
					}
				})
			}
		})
	})
}

function handleNew(payload) {
	// Get the issue, not the PR
	request(constructGet(payload.pull_request.issue_url), (err, res, body) => {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			console.log('NEW Labels:', JSON.parse(body).labels)
			const labels = JSON.parse(body).labels || []

			const head = payload.pull_request.head.ref,
				prBody = payload.pull_request.body || '',
				tickets = prBody.match(jiraRegex)

			if (head === 'staging') {
				return 'New Pr -- Don\'t need to handle'
			}

			// If there aren't any JIRA tickets in the body as well, warn them
			if (!tickets && !labels.map(l => l.name).includes('$$webhook')) {
				const feedback = `@${payload.pull_request.user.login} - It looks like you didn't include JIRA ticket references in this ticket.  Are you sure you have none to reference?`
				request(constructPost(`${payload.pull_request.issue_url}/comments`, { body: feedback }))
				request(constructPost(`${payload.pull_request.issue_url}/labels`, ['$$ticketless']))

				firebase.log('github', payload.repository.full_name, 'pull_request', 'ticketless', payload)
			}

			// If the branch isn't a feature branch, ask about it
			if (!head.includes('feature-') && !labels.map(l => l.name).includes('$$webhook')) {
				const feedback = `@${payload.pull_request.user.login} - It looks like your branch doesn't contain \`feature-\`.  Are you sure this PR shouldn't be a feature branch?`
				request(constructPost(`${payload.pull_request.issue_url}/comments`, { body: feedback }))
				request(constructPost(`${payload.pull_request.issue_url}/labels`, ['$$featureless']))

				firebase.log('github', payload.repository.full_name, 'pull_request', 'featureless', payload)
			} else {
				const parsedBranch = head.substr(head.indexOf('-') + 1, head.length),
					url = `http://zzz-${parsedBranch}.s3-website-us-east-1.amazonaws.com/`

				request(constructPost(`${payload.pull_request.issue_url}/comments`, { body: `@${payload.pull_request.user.login} - Thanks for the PR! Your feature branch is now [live](${url})` }))

				firebase.log('github', payload.repository.full_name, 'reelio_deploy/feature', null, {
					tickets: tickets.filter(uniqueTicketFilter),
					fixed_count: tickets.filter(uniqueTicketFilter).length,
					environment: parsedBranch,
					target: 'url',
				})

			}

			return 'New PR -- Complete'
		}

		return 'New PR -- Unhandled but requested'
	})
}

function handleMerge(payload) {
	let labels = [],
		reviews = []

	const tickets = payload.pull_request.body.match(jiraRegex) || [],
		newBody = `### Resolves:\n${tickets.filter(uniqueTicketFilter).map(wrapJiraTicketsFromArray).join('\n\t')}`

	const user = FRONTEND_MEMBERS[payload.pull_request.user.id],
		base = payload.pull_request.base.ref // target of the original PR

	// Get the issue, not the PR
	request(constructGet(payload.pull_request.issue_url), (err, res, body) => {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			labels = JSON.parse(body).labels || []
		}

		if (
			labels.length &&
			base === 'staging'
		) {
			createPullRequest('staging', 'master', payload, newBody, ['$$production'])
		}

		// If the closed PRs target was the master branch, alert QA of impending release
		if (base === 'master') {
			Slack.slackDeployWarning(payload, tickets)

			firebase.log('github', payload.repository.full_name, 'reelio_deploy', null, {
				tickets: tickets.filter(uniqueTicketFilter),
				fixed_count: tickets.filter(uniqueTicketFilter).length,
				environment: 'production',
				target: 'pro.reelio.com',
			})
		}
	})

	// Get the reviews
	request(constructGet(`${payload.pull_request.url}/reviews`), (err, res, body) => {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			reviews = JSON.parse(body) || []
			reviews = reviews.map(r => r.state)
		}
		// If the PR was merged without any changes requested, :tada: to the dev!
		if (
			!reviews.includes('CHANGES_REQUESTED') &&
			user.slack_id !== 'U28LB0AAH' &&
			payload.pull_request.user.id.toString() !== '25992031'
		) {
			Slack.slackCongrats(payload, user)
			firebase.log('github', payload.repository.full_name, 'pull_request', 'party_parrot', payload)
		}
	})

	return 'Merged!'
}

function PullRequest(req, reply) {
	const payload = req.payload

	if (payload.action === 'labeled' || payload.action === 'unlabeled') {
		Labels(payload)
	}

	if (payload.action === 'opened') {
		return handleNew(payload, reply)
	}

	if (payload.action === 'closed' && payload.pull_request.merged_at) {
		return handleMerge(payload, reply)
	}

	return 'Got a pull request!!!'
}

export default PullRequest

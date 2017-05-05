import { jiraRegex, FRONTEND_MEMBERS } from '../../consts'
import { uniqueTicketFilter, wrapJiraTicketsFromArray } from '../../helpers/utils'

import Github from '../../helpers/github'
import Jira from '../../helpers/jira'
import Tickets from '../../helpers/tickets'
import Slack from '../../helpers/slack'
import Firebase from '../../helpers/firebase'
import Labels from './Labels'

const request = require('request')

function createPullRequest(head, base, payload, newBody = '', labels = []) {
	// Check if there is a PR between the head and branch already.  If there is, we don't need to make a new PR
	request(Github.get(`${payload.repository.url}/pulls?head=${head}&base=${base}&state=open`), (response, errors, openPRs) => {
		const open = JSON.parse(openPRs)
		if (open.length) {
			// sometimes it returns non-results.
			const realOpen = open.filter(o => o.head.ref === head && o.base.ref === base)
			if (realOpen.length) {
				console.log('SKIPPING PR', head, base, open.map(o => ({ head: o.head.ref, base: o.base.ref })))

				// append the new resolved tickets to the existing PR
				// Assumes that there will only ever be ONE PR returned here...
				const editedBody = realOpen[0].body + newBody.substr(newBody.indexOf('\n'), newBody.length) // append the resolved tickets to the ticket list

				request(Github.patch(realOpen[0].url, { body: editedBody })) // update the body of the old PR
				return
			}
		}

		// create Issue.  To add lables to the PR on creation, it needs to start as an issue
		const issue = {
			title: `${head} --> ${base}`,
			body: `# Merging from branch ${head} into ${base}.\n\n### Previous PR: ${payload.pull_request.html_url}\n\n${newBody}`,
			labels: ['$$webhook', ...labels],
		}

		request(Github.post(`${payload.repository.url}/issues`, issue), (err, res, body) => {
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

				request(Github.post(`${payload.repository.url}/pulls`, pr), (e, r, b) => {
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
	request(Github.get(payload.pull_request.issue_url), (err, res, body) => {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			console.log('NEW Labels:', JSON.parse(body).labels)

			const labels = JSON.parse(body).labels || []
			const repo = payload.repository.html_url
			const head = payload.pull_request.head.ref,
				prBody = payload.pull_request.body || '',
				tickets = prBody.match(jiraRegex)

			if (head === 'staging') {
				return 'New Pr -- Don\'t need to handle'
			}

			// If there aren't any JIRA tickets in the body as well, warn them
			if (!tickets && !labels.map(l => l.name).includes('$$webhook')) {
				const feedback = `@${payload.pull_request.user.login} - It looks like you didn't include JIRA ticket references in this ticket.  Are you sure you have none to reference?`
				request(Github.post(`${payload.pull_request.issue_url}/comments`, { body: feedback }))
				request(Github.post(`${payload.pull_request.issue_url}/labels`, ['$$ticketless']))

				Firebase.log('github', payload.repository.full_name, 'pull_request', 'ticketless', payload)
			}

			// If the branch isn't a feature branch, ask about it
			if (!head.includes('feature-') && !labels.map(l => l.name).includes('$$webhook')) {
				const feedback = `@${payload.pull_request.user.login} - It looks like your branch doesn't contain \`feature-\`.  Are you sure this PR shouldn't be a feature branch?`
				request(Github.post(`${payload.pull_request.issue_url}/comments`, { body: feedback }))
				request(Github.post(`${payload.pull_request.issue_url}/labels`, ['$$featureless']))

				Firebase.log('github', payload.repository.full_name, 'pull_request', 'featureless', payload)
			} else {
				const parsedBranch = head.substr(head.indexOf('-') + 1, head.length),
					url = `http://zzz-${parsedBranch}.s3-website-us-east-1.amazonaws.com/`

				request(Github.post(`${payload.pull_request.issue_url}/comments`, { body: `@${payload.pull_request.user.login} - Thanks for the PR! Your feature branch is now [live](${url})` }))

				const ticketBase = 'https://reelio.atlassian.net/rest/api/2/issue'
				const responses = []
				const attempts = 0
				const uniqueTickets = tickets.filter(uniqueTicketFilter)

				uniqueTickets.map(t => request(Jira.post(`${ticketBase}/${t}`, 'jira'), (_, __, data) => {
					responses.push(JSON.parse(data))
				}))

				Tickets.getTicketResponses(responses, tickets, attempts, repo, (formattedTickets) => {
					Firebase.log('github', payload.repository.full_name, 'reelio_deploy/feature', null, {
						tickets: formattedTickets,
						fixed_count: tickets.filter(uniqueTicketFilter).length,
						environment: parsedBranch,
						target: 'url',
					})
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
	const uniqueTickets = tickets.filter(uniqueTicketFilter)
	const repo = payload.repository.html_url

	const user = FRONTEND_MEMBERS[payload.pull_request.user.id],
		base = payload.pull_request.base.ref // target of the original PR

	// Get the issue, not the PR
	request(Github.get(payload.pull_request.issue_url), (err, res, body) => {
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
			const fixed = tickets.filter(uniqueTicketFilter),
				formattedFixed = fixed.map(t => `<https://reelio.atlassian.net/browse/${t}|${t}>`).join('\n')
			Slack.slackDeployWarning(payload, formattedFixed)

			const ticketBase = 'https://reelio.atlassian.net/rest/api/2/issue'
			const responses = []
			const attempts = 0

			uniqueTickets.map(t => request(Jira.get(`${ticketBase}/${t}`, 'jira'), (_, __, data) => {
				responses.push(JSON.parse(data))
			}))

			Tickets.getTicketResponses(responses, tickets, attempts, repo, (formattedTickets) => {
				Firebase.log('github', payload.repository.full_name, 'reelio_deploy', null, {
					tickets: formattedTickets,
					fixed_count: tickets.filter(uniqueTicketFilter).length,
					environment: 'production',
					target: 'pro.reelio.com',
				})
			})
		}
	})


	// Get the reviews
	request(Github.get(`${payload.pull_request.url}/reviews`), (err, res, body) => {
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
			Firebase.log('github', payload.repository.full_name, 'pull_request', 'party_parrot', payload)
		}
	})

	return 'Merged!'
}

function PullRequest(payload) {

	if (payload.action === 'labeled' || payload.action === 'unlabeled') {
		Labels(payload)
		return 'Pull Request -- Labels Handled'
	}

	if (payload.action === 'opened') {
		return handleNew(payload)
	}

	if (payload.action === 'closed' && payload.pull_request.merged_at) {
		return handleMerge(payload)
	}

	return 'Pull Request -- No action taken'
}

export default PullRequest

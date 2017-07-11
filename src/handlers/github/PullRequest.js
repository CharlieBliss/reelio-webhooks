import request from 'request'
import rp from 'request-promise'

import { jiraRegex, FRONTEND_MEMBERS } from '../../consts'
import { uniqueTicketFilter, wrapJiraTicketsFromArray, checkMergeStatus } from '../../helpers/utils'

import Github from '../../helpers/github'
import Jira from '../../helpers/jira'
import Firebase from '../../helpers/firebase'
import Labels from './Labels'
import Slack from '../../helpers/slack'
import Tickets from '../../helpers/tickets'

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

		// create Issue.  To add labels to the PR on creation, it needs to start as an issue
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

function handleNew(payload, config) {
	// Get the issue, not the PR
	request(Github.get(payload.pull_request.issue_url), (err, res, body) => {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			const labels = JSON.parse(body).labels || []
			const repo = payload.repository.html_url
			const head = payload.pull_request.head.ref,
				prBody = payload.pull_request.body || '',
				tickets = prBody.match(jiraRegex) || [],
				author = payload.pull_request.user

			const ticketBase = 'https://reelio.atlassian.net/rest/api/2/issue'
			const responses = []
			const uniqueTickets = tickets.filter(uniqueTicketFilter)

			if (author.id.toString() === '25992031') {
				return 'Devops PR -- Don\'t need to handle'
			}

			// If there aren't any JIRA tickets in the body as well, warn them
			if (
				!tickets.length &&
				!labels.map(l => l.name).includes('$$webhook') &&
				config.opened &&
				(config.opened.enabled || config.opened.tickets)
			) {
				const feedback = `@${payload.pull_request.user.login} - It looks like you didn't include JIRA ticket references in this ticket.  Are you sure you have none to reference?`
				request(Github.post(`${payload.pull_request.issue_url}/comments`, { body: feedback }))
				request(Github.post(`${payload.pull_request.issue_url}/labels`, ['$$ticketless']))

				Firebase.log('github', payload.repository.full_name, 'pull_request', 'ticketless', payload)
			}

			// If the branch isn't a feature branch, ask about it
			if (
				!head.includes('feature-') &&
				!labels.map(l => l.name).includes('$$webhook') &&
				config.opened &&
				(config.opened.enabled || config.opened.feature)
			) {
				const feedback = `@${payload.pull_request.user.login} - It looks like your branch doesn't contain \`feature-\`.  Are you sure this PR shouldn't be a feature branch?`
				request(Github.post(`${payload.pull_request.issue_url}/comments`, { body: feedback }))
				request(Github.post(`${payload.pull_request.issue_url}/labels`, ['$$featureless']))

				Firebase.log('github', payload.repository.full_name, 'pull_request', 'featureless', payload)
			} else {
				const parsedBranch = head.substr(head.indexOf('-') + 1, head.length),
					url = `http://features.pro.reelio.com/${parsedBranch}`

				request(Github.post(`${payload.pull_request.issue_url}/comments`, { body: `@${payload.pull_request.user.login} - Thanks for the PR! Your feature branch is now [live](${url})` }))

				// If tickets are enabled, grab their information and save it to firebase
				if (config.opened.enabled || config.opened.tickets) {
					Promise.all(uniqueTickets.map(t => rp(Jira.get(`${ticketBase}/${t}`)) //eslint-disable-line
						.then((data) => {
							responses.push(JSON.parse(data))
						})))
							.then(() => {
								const formattedTickets = Tickets.formatTicketData(responses, repo)

								Firebase.log('github', payload.repository.full_name, 'reelio_deploy/feature', null, {
									tickets: formattedTickets,
									fixed_count: tickets.filter(uniqueTicketFilter).length,
									environment: parsedBranch,
									target: 'url',
								})
							})
				}
				if (config.opened.transition) {
					uniqueTickets.forEach((ticket) => {
						Tickets.transitionTicket(`${ticketBase}/${ticket}`, 21)
					})
				}
			}

			return 'New PR -- Complete'
		}

		return 'New PR -- Unhandled but requested'
	})
}

function handleMerge(payload, config) {
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
			base === 'staging' &&
			config.merged.create
		) {
			createPullRequest('staging', 'master', payload, newBody, ['$$production'])
		}

		// If the closed PRs target was the master branch, alert QA of impending release
		if (
			base === 'master' &&
			config.merged.alert &&
			config.merged.alert.channel &&
			config.merged.alert.url &&
			config.merged.alert.env
		) {
			const alertConfig = config.merged.alert

			const fixed = tickets.filter(uniqueTicketFilter),
				formattedFixed = fixed.map(t => `<https://reelio.atlassian.net/browse/${t}|${t}>`).join('\n')

			Slack.slackDeployWarning(payload, formattedFixed, alertConfig.channel, `<${alertConfig.url}|${alertConfig.env}>`)

			const ticketBase = 'https://reelio.atlassian.net/rest/api/2/issue'
			const responses = []

			if (uniqueTickets.length < 10) {
				Promise.all(uniqueTickets.map(t => rp(Jira.get(`${ticketBase}/${t}`)) //eslint-disable-line
					.then((data) => {
						responses.push(JSON.parse(data))
					}),
				)).then(() => {
					const formattedTickets = Tickets.formatTicketData(responses, repo)

					Firebase.log('github', payload.repository.full_name, 'reelio_deploy', null, {
						tickets: formattedTickets,
						fixed_count: uniqueTickets.length,
						environment: alertConfig.env,
						target: alertConfig.url,
					})
				})
			} else {
				Firebase.log('github', payload.repository.full_name, 'reelio_deploy', null, {
					tickets: uniqueTickets,
					fixed_count: uniqueTickets.length,
					environment: alertConfig.env,
					target: alertConfig.url,
				})
			}

		}
	})


	if (config.merged.congrats) {
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
	}
	if (config.merged.conflicts) {
		checkMergeStatus(payload)
	}
	return 'Merged!'
}

function PullRequest(payload, config) {

	if (
		(payload.action === 'labeled' || payload.action === 'unlabeled') &&
		config.labels
	) {
		Labels(payload)
		return 'Pull Request -- Labels Handled'
	}

	if (
		payload.action === 'opened' &&
		config.opened
	) {
		return handleNew(payload, config)
	}

	if (
		payload.action === 'closed' &&
		payload.pull_request.merged_at &&
		config.merged
	) {
		return handleMerge(payload, config)
	}

	return 'Pull Request -- No action taken'
}

export default PullRequest

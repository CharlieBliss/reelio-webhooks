import firebase from './firebase'
import { versionRegex, jiraRegex, SLACK_URL, FRONTEND_MEMBERS } from './consts'
import { uniqueTicketFilter, wrapJiraTicketsFromArray, constructGet, constructPost, constructPatch, constructPut } from './utils'

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

			// If making the issue fails, tell Kyle
			if (body.errors) {
				request(constructPost(SLACK_URL, {
					channel: 'U28LB0AAH',
					username: 'PR Bot',
					icon_url: 'https://octodex.github.com/images/yaktocat.png',
					text: `Something went wrong when trying to make new PRs based off of: <${payload.pull_request.html_url}|GitHub>.\n\n\`\`\`${resBody.errors}\`\`\``,
				}))
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
						request(constructPost(SLACK_URL, {
							channel: 'U28LB0AAH',
							username: 'PR Bot',
							icon_url: 'https://octodex.github.com/images/yaktocat.png',
							text: `Something went wrong when trying to make new PRs based off of: <${payload.pull_request.html_url}|a github PR>.\n\n\`\`\`${resBody.errors.message}\`\`\``,
						}))
					}
				})
			}
		})
	})

}

function handleNew(payload, reply) {
	const user = FRONTEND_MEMBERS[payload.pull_request.user.id]

	// Get the issue, not the PR
	request(constructGet(payload.pull_request.issue_url), (err, res, body) => {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			console.log('NEW Labels:', JSON.parse(body).labels)
			const labels = JSON.parse(body).labels || []

			const filteredLabels = labels.filter(label => versionRegex.test(label.name)),
				head = payload.pull_request.head.ref,
				base = payload.pull_request.base.ref,
				prBody = payload.pull_request.body || '',
				tickets = prBody.match(jiraRegex)

			// If the PR is needing a review (not a webhook PR or a deploy PR), add the reviewer checkboxes
			if (
				!labels.map(l => l.name).includes('$$webhook') &&
				!head.includes('staging') &&
				!head.includes('production') &&
				!head.includes('master')
			) {
				request(constructPatch(payload.pull_request.url, { body: `${payload.pull_request.body} \n\n - [ ] Review 1\n - [ ] Review 2 ( Kyle )` })) // add the reviewer checkboxes
			}

			// If there aren't any JIRA tickets in the body as well, warn them
			if (!tickets && !labels.map(l => l.name).includes('$$webhook')) {
				const feedback = `@${payload.pull_request.user.login} - It looks like you didn't include JIRA ticket references in this ticket.  Are you sure you have none to reference?`
				request(constructPost(`${payload.pull_request.issue_url}/comments`, { body: feedback }))
				request(constructPost(`${payload.pull_request.issue_url}/labels`, ['$$ticketless']))

				firebase.log('github', payload.repository.full_name, 'pull_request', 'ticketless', payload)
			}

			// If there aren't any version labels, and the PR isn't to a version branch or dev,
			// warn the developer to add labels, and label the PR "Incomplete"
			if (
				!filteredLabels.length &&
				!labels.map(l => l.name).includes('$$webhook') &&
				base !== 'dev' &&
				!head.includes('staging') &&
				!head.includes('master')
			) {

				const feedback = `@${payload.pull_request.user.login} - It looks like you forgot to label this PR with a version tag.  Please update your PR to include targetted version distrubtions.  Thanks!`
				request(constructPost(`${payload.pull_request.issue_url}/comments`, { body: feedback }))
				request(constructPost(`${payload.pull_request.issue_url}/labels`, ['$$incomplete']))
				firebase.log('github', payload.repository.full_name, 'pull_request', 'labelless', payload)

				if (user) {
					request(constructPost(SLACK_URL, {
						channel: user.slack_id,
						username: 'Label Bot',
						icon_url: 'https://octodex.github.com/images/privateinvestocat.jpg',
						text: `Hey there, ${user.name}.  Your pull request is missing labels!  Please add labels for <${payload.pull_request.html_url}|your PR>.`,
					}))
				}

				return reply('New PR -- Incomplete')
			}

			return reply('New PR -- Complete')
		}

		return reply('New PR -- Unhandled but requested')
	})
}

function handleMerge(payload, reply) {
	let labels = [],
		filteredLabels = [],
		reviews = []

	const tickets = payload.pull_request.body.match(jiraRegex) || [],
		newBody = `### Resolves:\n${tickets.filter(uniqueTicketFilter).map(wrapJiraTicketsFromArray).join('\n\t')}`

	const user = FRONTEND_MEMBERS[payload.pull_request.user.id],
		base = payload.pull_request.base.ref, // target of the original PR
		head = payload.pull_request.head.ref  // The original PR's head

	// Get the issue, not the PR
	request(constructGet(payload.pull_request.issue_url), (err, res, body) => {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			labels = JSON.parse(body).labels || []

			filteredLabels = labels.filter(label => versionRegex.test(label.name))
		}

		const currentDev = '3.1' // @TODO this is a messy hack.  This shouldn't need to be a const

		// If there were version labels, create new PRs targetting those branches
		// Example: PR into 3.0-dev is tagged 3.0 && 3.1 -> PR to 3.1-dev
		//          PR into 3.0-dev is tagged 3.0 -> no action
		if (filteredLabels.length) {
			filteredLabels.forEach((label) => {
				// only make new PR if the label doesn't match the current branch.
				if (!base.includes(label.name)) {
					createPullRequest(head, `${label.name}-dev`, payload, newBody, ['only'])
				}
			})
		}

		if (
			labels.length &&
			labels.includes('$$production') &&
			base.includes('staging')
		) {
			let target = base.substr(0, base.indexOf('-')) // get the version number of the current branch
			target = target ? `${target}-production` : 'master'

			createPullRequest(head, target, payload, newBody)
		}


		// If the closed PRs target was a dev branch, continue the PR along the path
		// Example: 3.0-dev is accepted -> new PR into 3.0-staging
		//          dev is accepted -> new PR into staging
		if (base.includes('dev')) {
			const version = base.substr(0, base.indexOf('-')) // get the version number of the current branch
			const target = version ? `${version}-staging` : 'staging'

			createPullRequest(base, target, payload, newBody)

			// BEGIN JIRA INTEGRATION

			// Because this PR is going into a dev branch, we build a workflow table for JIRA tickets
			const fixed = tickets.filter(uniqueTicketFilter)
			fixed.forEach((ticket) => {
				const ticketUrl = `https://reelio.atlassian.net/rest/api/2/issue/${ticket}`
				const header = '|| ||PR Submitted|| Deployed to Staging|| QA Approved ||'

				request(constructGet(ticketUrl, 'jira'), (error, response, bdy) => {
					if (JSON.parse(bdy).fields.customfield_10900) {
						return // the ticket already has a table
					}

					let table = []

					// If there aren't any version labels, this is going right into dev.
					if (filteredLabels.length) {
						table.push(`| *${currentDev}* | No | No | |`)
					} else {
						table.push(`| *${currentDev}* | No | No | |`)
					}

					// Loop through all labels on the PR and make sure the ticket references all envs
					filteredLabels
						.forEach((l) => {
							if (l.name === version) {
								table.push(`| *${l.name}* | [Yes|${payload.pull_request.html_url}] | No | |`)
							} else {
								table.push(`| *${l.name}* | No | No | |`)
							}

						})

					table = table.sort((a, b) => b.match(/\d\.\d/) - a.match(/\d\.\d/)) // sort by version #
					table.unshift(header) // add the header in
					table = table.join('\n') // concatenate back into a string

					console.log('FIXED TICKET', ticket, table)

					request(constructPut(`${ticketUrl}`, {
						fields: {
							customfield_10900: table,
						},
					}, 'jira'), (_, __, resBody) => {

						const resp = JSON.parse(resBody)
						if (resp.errorMessages) {
							request(constructPost(SLACK_URL, {
								channel: 'U28LB0AAH',
								username: 'PR Bot',
								icon_url: 'https://octodex.github.com/images/yaktocat.png',
								text: `Something went wrong when trying to update the table for: <https://reelio.atlassian.net/browse/${ticket}|${ticket}>.\n\n\`\`\`${resp.errorMessages.join('\n')}\`\`\``,
							}))
							firebase.log('JIRA', 'FRONT', 'table', 'failed', resp)

							console.log('TICKET TABLE FAILED', resp)
						}
					})
				})

			})
		}

		// If PR target was dev branch and it's not tagged "only", create a PR into dev
		// Example: 3.0-dev is accepted -> new PR into dev
		if (
			versionRegex.test(base) &&
			base.includes('dev') &&
			!labels.map(l => l.name).includes('only')
		) {
			createPullRequest(head, 'dev', payload, newBody)
		}

		// If the closed PRs target was a staging branch, alert QA of impending release
		// Example: 3.0-staging is accepted -> post in slack all tickets about to be released.
		if (base.includes('staging')) {
			const fixed = tickets.filter(uniqueTicketFilter),
				formattedFixed = fixed.map(t => `<https://reelio.atlassian.net/browse/${t}|${t}>`).join('\n')

			const version = base.substr(0, base.indexOf('-')) || 'dev' // get the version number of the current branch
			const deployVersion = version === 'dev' ? currentDev : version

			// Skip if there are only test tickets
			if (fixed.filter(t => !t.toUpperCase().includes('TEST')).length) {
				request(constructPost(SLACK_URL, {
					channel: '#frontend-deploys',
					username: 'Deploy Bot',
					icon_url: 'https://octodex.github.com/images/welcometocat.png',
					text: `*A deploy to <http://${deployVersion}-staging.reelio.com|${deployVersion}-staging> is pending.*  The changes will be ready in ~15 minutes.\n\nThe deploy is based off of <${payload.pull_request.html_url}|PR ${payload.pull_request.number}>.\n\n*\`-- Fixes --\`*`,
					attachments: [
						{
							text: formattedFixed,
							color: '#36a64f',
						},
						{
							text: `<${deployVersion}-staging.reelio.com|${deployVersion}-staging.reelio.com>`,
							color: '#de2656',
						},
					],
				}))

				firebase.log('github', payload.repository.full_name, 'reelio_deploy', null, {
					tickets: tickets.filter(uniqueTicketFilter),
					fixed_count: tickets.filter(uniqueTicketFilter).length,
					version: deployVersion,
					environment: 'staging',
					target: `${deployVersion}-staging.reelio.com`,
				})
			}


			// BEGING JIRA INTEGRATION
			fixed.forEach((ticket) => {
				const ticketUrl = `https://reelio.atlassian.net/rest/api/2/issue/${ticket}`

				// Make sure the ticket is marked as `Ready for QA`
				request(constructPost(`${ticketUrl}/transitions`, {
					transition: {
						id: 121,
					},
				}, 'jira'))
				firebase.log('JIRA', 'FRONT', 'transition', 'QA', { ticket })

				// Update the current workflow table with new progress
				request(constructGet(ticketUrl, 'jira'), (error, response, bdy) => {
					if (error) {
						// getting ticket failed
					}
					const ticketInfo = JSON.parse(bdy),
						workflowField = ticketInfo.fields.customfield_10900 || '',
						qaAssignee = ticketInfo.fields.customfield_10901

					if (qaAssignee) {
						request(constructPost(`${ticketUrl}/comment`, {
							body: `[~${qaAssignee.key}] This ticket was just deployed to [${deployVersion}-staging|http://${deployVersion}-staging.reelio.com] and will be ready to be tested on that environment in about 10 minutes!`,
						}, 'jira'))

						firebase.log('JIRA', 'FRONT', 'qaAssignee', 'alerted', { assignee: qaAssignee, ticket })
					}


					const tableRows = workflowField.split('\n') // get the table rows
					let newTable = workflowField // copy the old table

					if (tableRows.length > 2) {
						// There are more than 2 rows, so we need to figure out which to update
						newTable = tableRows.map((row) => {
							// If the current table row doesn't include the current branch version, don't edit
							if (row.includes(version)) {
								return `| *${version}* | [Yes|${payload.pull_request.html_url}] | [Yes|http://${version}-staging.reelio.com] | |`
							} else if (version === 'dev' && row.includes(currentDev)) {
								return `| *${currentDev}* | [Yes|${payload.pull_request.html_url}] | [Yes|http://${currentDev}-staging.reelio.com] | |`
							}

							return row
						})
					} else {
						tableRows[1] = `| *${deployVersion}* | [Yes|${payload.pull_request.html_url}] | [Yes|http://${deployVersion}-staging.reelio.com] | |`
						newTable = tableRows
					}

					// Update the ticket with our new table
					request(constructPut(`${ticketUrl}`, {
						fields: {
							customfield_10900: newTable.join('\n'),
						},
					}, 'jira'), (_, __, resBody) => {
						if (!resBody) {
							firebase.log('JIRA', 'FRONT', 'table', 'updated', { ticket })
							return
						}

						const resp = JSON.parse(resBody)

						if (resp.errorMessages) {
							request(constructPost(SLACK_URL, {
								channel: 'U28LB0AAH',
								username: 'PR Bot',
								icon_url: 'https://octodex.github.com/images/yaktocat.png',
								text: `Something went wrong when trying to update the table for: <https://reelio.atlassian.net/browse/${ticket}|${ticket}>.\n\n\`\`\`${resp.errorMessages.join('\n')}\`\`\``,
							}))

							console.log('TICKET TABLE FAILED', resp)
						}
					})
				})
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
			request(constructPost(SLACK_URL, {
				channel: user.slack_id,
				username: 'Merge Bot',
				icon_url: 'https://octodex.github.com/images/welcometocat.png',
				text: `:tada::party_parrot::tada:Nice work, ${user.name}!  Your <${payload.pull_request.html_url}|pull request> was merged without needing changes! Keep up the good work! :tada::party_parrot::tada:`,
			}))
			firebase.log('github', payload.repository.full_name, 'pull_request', 'party_parrot', payload)
		}
	})


	return reply('Merged!')
}

function PullRequest(req, reply) {
	const payload = req.payload

	if (payload.action === 'opened') {
		return handleNew(payload, reply)
	}

	if (payload.action === 'closed' && payload.pull_request.merged_at) {
		return handleMerge(payload, reply)
	}

	return reply('Got a pull request!!!')
}

export default PullRequest

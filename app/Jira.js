import moment from 'moment'
import request from 'request'

import firebase from './firebase'
import { SLACK_URL, jiraRegex } from './consts'
import { constructPost, constructPut, constructGet, constructDelete, uniqueTicketFilter } from './utils'
// import { uniqueTicketFilter, constructGet, constructPut, constructPost } from './utils'
// import Slack from './Slack'

// export function buildJiraWorkflow(tickets, payload) {
// 	const fixed = tickets.filter(uniqueTicketFilter)
// 	fixed.forEach((ticket) => {
// 		const ticketUrl = `https://reelio.atlassian.net/rest/api/2/issue/${ticket}`
// 		const header = '|| ||PR Submitted|| Deployed to Staging|| QA Approved || Deployed On||'

// 		request(constructGet(ticketUrl, 'jira'), (error, response, bdy) => {
// 			if (JSON.parse(bdy).fields.customfield_10900) {
// 				return // the ticket already has a table
// 			}

// 			let table = []

//       // If there aren't any version labels, this is going right into dev.
// 			if (filteredLabels.length) {
// 				table.push(`| *${currentDev}* | No | No | |`)
// 			} else {
// 				table.push(`| *${currentDev}* | No | No | |`)
// 			}

//       // Loop through all labels on the PR and make sure the ticket references all envs
// 			filteredLabels.forEach((l) => {
// 				if (l.name === version) {
// 					table.push(`| *${l.name}* | [Yes|${payload.pull_request.html_url}] | No | |`)
// 				} else {
// 					table.push(`| *${l.name}* | No | No | |`)
// 				}
// 			})

// 			table = table.sort((a, b) => b.match(/\d\.\d/) - a.match(/\d\.\d/)) // sort by version #
// 			table.unshift(header) // add the header in
// 			table = table.join('\n') // concatenate back into a string

// 			console.log('FIXED TICKET', ticket, table)

// 			request(constructPut(`${ticketUrl}`, {
// 				fields: {
// 					customfield_10900: table,
// 				},
// 			}, 'jira'), (_, __, resBody) => {

// 				const resp = JSON.parse(resBody)
// 				if (resp.errorMessages) {
// 					Slack('error', payload, resBody)
// 					firebase.log('JIRA', 'FRONT', 'table', 'failed', resp)

// 					console.log('TICKET TABLE FAILED', resp)
// 				}
// 			})
// 		})
// 	})
// }

// function updateJiraWorkflow(fixed, deployVersion, version, currentDev, payload) {
// 	fixed.forEach((ticket) => {
// 		const ticketUrl = `https://reelio.atlassian.net/rest/api/2/issue/${ticket}`

//     // Make sure the ticket is marked as `Ready for QA`
// 		request(constructPost(`${ticketUrl}/transitions`, {
// 			transition: {
// 				id: 221,
// 			},
// 		}, 'jira'))
// 		firebase.log('JIRA', 'FRONT', 'transition', 'QA', { ticket })

//     // Update the current workflow table with new progress
// 		request(constructGet(ticketUrl, 'jira'), (error, response, bdy) => {
// 			if (error) {
//         // getting ticket failed
// 			}
// 			const ticketInfo = JSON.parse(bdy),
// 				workflowField = ticketInfo.fields.customfield_10900 || '',
// 				qaAssignee = ticketInfo.fields.customfield_10901

// 			if (qaAssignee) {
// 				request(constructPost(`${ticketUrl}/comment`, {
// 					body: `[~${qaAssignee.key}] This ticket was just deployed to [${deployVersion}-staging|http://${deployVersion}-staging.reelio.com] and will be ready to be tested on that environment in about 10 minutes!`,
// 				}, 'jira'))

// 				firebase.log('JIRA', 'FRONT', 'qaAssignee', 'alerted', { assignee: qaAssignee, ticket })
// 			}


// 			const tableRows = workflowField.split('\n') // get the table rows
// 			let newTable = workflowField // copy the old table

// 			if (tableRows.length > 2) {
//         // There are more than 2 rows, so we need to figure out which to update
// 				newTable = tableRows.map((row) => {
//           // If the current table row doesn't include the current branch version, don't edit
// 					if (row.includes(version)) {
// 						return `| *${version}* | [Yes|${payload.pull_request.html_url}] | [Yes|http://${version}-staging.reelio.com] | | ${moment().format('MM/DD/YYYY')}`
// 					} else if (version === 'dev' && row.includes(currentDev)) {
// 						return `| *${currentDev}* | [Yes|${payload.pull_request.html_url}] | [Yes|http://${currentDev}-staging.reelio.com] | | ${moment().format('MM/DD/YYYY')}`
// 					}
// 					return row
// 				})
// 			} else {
// 				tableRows[1] = `| *${deployVersion}* | [Yes|${payload.pull_request.html_url}] | [Yes|http://${deployVersion}-staging.reelio.com] | | ${moment().format('MM/DD/YYYY')}`
// 				newTable = tableRows
// 			}

//       // Update the ticket with our new table
// 			request(constructPut(`${ticketUrl}`, {
// 				fields: {
// 					customfield_10900: newTable.join('\n'),
// 				},
// 			}, 'jira'), (_, __, resBody) => {
// 				if (!resBody) {
// 					firebase.log('JIRA', 'FRONT', 'table', 'updated', { ticket })
// 					return
// 				}

// 				const resp = JSON.parse(resBody)

// 				if (resp.errorMessages) {
// 					request(constructPost(SLACK_URL, {
// 						channel: 'U28LB0AAH',
// 						username: 'PR Bot',
// 						icon_url: 'https://octodex.github.com/images/yaktocat.png',
// 						text: `Something went wrong when trying to update the table for: <https://reelio.atlassian.net/browse/${ticket}|${ticket}>.\n\n\`\`\`${resp.errorMessages.join('\n')}\`\`\``,
// 					}))
// 					console.log('TICKET TABLE FAILED', resp)
// 				}
// 			})
// 		})
// 	})
// }

class Jira {
	transitionTickets(tickets, payload) {
		const head = payload.pull_request.head.ref
		const parsedBranch = head.substr(head.indexOf('-') + 1, head.length)

		tickets.forEach((ticket) => {
			const ticketUrl = `https://reelio.atlassian.net/rest/api/2/issue/${ticket}`,
				table = `|| Deployed On || PR API || PR Human || Deployed || QA Approved || \n || ${moment().format('l')} || [(internal use)|${payload.pull_request.url}] || [${payload.pull_request.number}|${payload.pull_request.html_url}] || [Yes|http://zzz-${parsedBranch}.s3-website-us-east-1.amazonaws.com/] || ||`

		// Make sure the ticket is marked as `Ready for QA`
			request(constructPost(`${ticketUrl}/transitions`, {
				transition: {
					id: 221,
				},
			}, 'jira'))
			firebase.log('JIRA', 'FRONT', 'transition', 'QA', { ticket })

			// Update the ticket with our new table
			request(constructPut(`${ticketUrl}`, {
				fields: {
					customfield_10900: table,
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

			return 'Tickets marked up'
		})
	}

	handleTransition(req) {
		console.log('TRANSITION', req.payload.transition.transitionId)
		// GOOD Transition ID = 51
		// if transition.id !== 51, status = declined
		if (req.payload.transition.transitionId === 51) {
			console.log(req.payload.issue)
			const TicketTable = req.payload.issue.fields.customfield_10900

			if (!TicketTable) {
				// Warn Kyle.  This should be impossible
				request(constructPost(SLACK_URL, {
					channel: 'U28LB0AAH',
					username: 'PR Bot',
					icon_url: 'https://octodex.github.com/images/yaktocat.png',
					text: `There was no table for ticket <https://reelio.atlassian.net/browse/${req.payload.issue.key}|${req.payload.issue.key}>`,
				}))
				return 'No table ticket!!!'
			}

			const PRRoute = TicketTable.match(/\[\(internal use\)\|([^\]]*)\]/)[1]
			request(constructGet(PRRoute), (err, res, resBody) => {
				const PR = JSON.parse(resBody),
					body = PR.body || '',
					tickets = body.match(jiraRegex) || [],
					uniqueTickets = tickets.filter(uniqueTicketFilter),
					sha = PR.head.sha

				// If there's only one ticket, it was just approved so this PR is good
				if (uniqueTickets.length === 1) {
					request(constructPost(`${PR.head.repo.url}/statuses/${sha}`, {
						state: 'success',
						description: 'All tickets marked as complete.',
						context: 'ci/qa-team',
					}))

					request(constructPost(`${PR.issue_url}/labels`, ['$$qa approved']))
					request(constructDelete(`${PR.issue_url}/labels/%24%24qa`))
				} else {
					const ticketBase = 'https://reelio.atlassian.net/rest/api/2/issue'

					const responses = []
					let attempts = 0

					tickets.map(t => request(constructGet(`${ticketBase}/${t}`, 'jira'), (_, __, data) => {
						responses.push(JSON.parse(data))
					}))

					// @TODO move this out
					function getTicketResponses() { // eslint-disable-line
						if (
							responses.length < uniqueTickets.length &&
							attempts < 20
						) {
							setTimeout(() => {
								getTicketResponses()
								attempts += 1
								console.log('LOOPING', responses.length, attempts)
							}, 1000)

						} else {
							const resolved = responses.filter(ticket => ticket.fields.status.id === '10001')

							if (resolved.length === uniqueTickets.length) {
								request(constructPost(`${PR.head.repo.url}/statuses/${sha}`, {
									state: 'success',
									description: 'All tickets marked as complete.',
									context: 'ci/qa-team',
								}))

								request(constructPost(`${PR.issue_url}/labels`, ['$$qa approved']))
								request(constructDelete(`${PR.issue_url}/labels/%24%24qa`))

							} else {
								const unresolved = uniqueTickets.length - resolved.length
								request(constructPost(`${PR.head.repo.url}/statuses/${sha}`, {
									state: 'failure',
									description: `Waiting on ${unresolved} ticket${unresolved > 1 ? 's' : ''} to be marked as "done".`,
									context: 'ci/qa-team',
								}))
							}
						}
					}

					getTicketResponses()
				}
			})
		}

		return 'PR status updated'
	}
}


export default new Jira()

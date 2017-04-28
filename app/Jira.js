import moment from 'moment'
import request from 'request'

import firebase from './firebase'
import { SLACK_URL, jiraRegex } from './consts'
import { constructPost, constructPut, constructGet, constructDelete, uniqueTicketFilter } from './utils'

import Tickets from './Tickets'

class Jira {
	transitionTickets(tickets, payload) {
		const head = payload.pull_request.head.ref
		const parsedBranch = head.substr(head.indexOf('-') + 1, head.length)
		const repo = payload.repository.html_url

		tickets.forEach((ticket) => {
			const ticketUrl = `https://reelio.atlassian.net/rest/api/2/issue/${ticket}`,
				table = `|| Deployed On || PR API || PR Human || Deployed || QA Approved || \n || ${moment().format('l')} || [(internal use)|${payload.pull_request.url}] || [${payload.pull_request.number}|${payload.pull_request.html_url}] || [Yes|http://zzz-${parsedBranch}.s3-website-us-east-1.amazonaws.com/] || ||`

		// Make sure the ticket is marked as `Ready for QA`
			request(constructPost(`${ticketUrl}/transitions`, {
				transition: {
					id: 221,
				},
			}, 'jira'))

			Tickets.getTicketFirebaseInfo(ticket, repo, (board, data) => {
				firebase.log('JIRA', board, 'transition', 'QA', { ticket: data })
			})
			// Update the ticket with our new table
			request(constructPut(`${ticketUrl}`, {
				fields: {
					customfield_10900: table,
				},
			}, 'jira'), (_, __, resBody) => {
				if (!resBody) {
					Tickets.getTicketFirebaseInfo(ticket, repo, (board, data) => {
						firebase.log('JIRA', board, 'table', 'updated', { ticket: data })
					})
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

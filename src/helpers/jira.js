import moment from 'moment'
import request from 'request'

import Slack from '../helpers/slack'
import Firebase from '../helpers/firebase'
import Tickets from '../helpers/tickets'
import Github from '../helpers/github'
import { uniqueTicketFilter } from '../helpers/utils'

import { JIRA_TOKEN, jiraRegex } from '../consts'

class JiraHelper {
	get headers() {
		return {
			Accept: 'application/json',
			Authorization: `Basic ${JIRA_TOKEN}`,
		}
	}

	get(url) {
		return {
			url,
			method: 'GET',
			headers: this.headers,
		}
	}

	post(url, payload) {
		return {
			url,
			method: 'POST',
			headers: this.headers,
			body: JSON.stringify(payload),
		}
	}

	patch(url, payload) {
		return {
			url,
			method: 'PATCH',
			headers: this.headers,
			body: JSON.stringify(payload),
		}
	}

	put(url, payload) {
		return {
			url,
			method: 'PUT',
			headers: this.headers,
			body: JSON.stringify(payload),
		}
	}

	delete(url) {
		return {
			url,
			method: 'DELETE',
			headers: this.headers,
		}
	}

	respond(message, statusCode = 200) {
		return {
			statusCode,
			body: `Jira -- ${message}`,
		}
	}

	transitionTickets(tickets, payload) {
		const head = payload.pull_request.head.ref
		const parsedBranch = head.substr(head.indexOf('-') + 1, head.length)
		const repo = payload.repository.html_url

		tickets.forEach((ticket) => {
			const ticketUrl = `https://reelio.atlassian.net/rest/api/2/issue/${ticket}`,
				table = `|| Deployed On || PR API || PR Human || Deployed || QA Approved || \n || ${moment().format('l')} || [(internal use)|${payload.pull_request.url}] || [${payload.pull_request.number}|${payload.pull_request.html_url}] || [Yes|http://zzz-${parsedBranch}.s3-website-us-east-1.amazonaws.com/] || ||`

			// Make sure the ticket is marked as `Ready for QA`
			request(this.post(`${ticketUrl}/transitions`, {
				transition: {
					id: 221,
				},
			}))

			Tickets.getTicketFirebaseInfo(ticket, repo, (board, data) => {
				Firebase.log('JIRA', board, 'transition', 'QA', { ticket: data })
			})
			// Update the ticket with our new table
			request(this.put(`${ticketUrl}`, {
				fields: {
					customfield_10900: table,
				},
			}), (_, __, resBody) => {
				if (!resBody) {
					Tickets.getTicketFirebaseInfo(ticket, repo, (board, data) => {
						Firebase.log('JIRA', board, 'table', 'updated', { ticket: data })
					})
					return
				}

				const resp = JSON.parse(resBody)

				if (resp.errorMessages) {
					Slack.tableFailed(ticket, resp)
				}
			})

			return 'Tickets marked up'
		})
	}

	handleTransition(payload) {
		// GOOD Transition ID = 51
		// if transition.id !== 51, status = declined
		if (payload.transition.transitionId === 51) {
			const TicketTable = payload.issue.fields.customfield_10900

			if (!TicketTable) {
				// Warn Kyle.  This should be impossible
				Slack.noTable(payload)
				return 'No table ticket!!!'
			}

			const PRRoute = TicketTable.match(/\[\(internal use\)\|([^\]]*)\]/)[1]
			request(Github.get(PRRoute), (err, res, resBody) => {
				const PR = JSON.parse(resBody),
					body = PR.body || '',
					tickets = body.match(jiraRegex) || [],
					uniqueTickets = tickets.filter(uniqueTicketFilter),
					sha = PR.head.sha

				// If there's only one ticket, it was just approved so this PR is good
				if (uniqueTickets.length === 1) {
					request(Github.post(`${PR.head.repo.url}/statuses/${sha}`, {
						state: 'success',
						description: 'All tickets marked as complete.',
						context: 'ci/qa-team',
					}))

					request(Github.post(`${PR.issue_url}/labels`, ['$$qa approved']))
					request(Github.delete(`${PR.issue_url}/labels/%24%24qa`))
				} else {
					const ticketBase = 'https://reelio.atlassian.net/rest/api/2/issue'

					const responses = []
					let attempts = 0

					tickets.map(t => request(this.get(`${ticketBase}/${t}`), (_, __, data) => {
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
								request(Github.post(`${PR.head.repo.url}/statuses/${sha}`, {
									state: 'success',
									description: 'All tickets marked as complete.',
									context: 'ci/qa-team',
								}))

								request(Github.post(`${PR.issue_url}/labels`, ['$$qa approved']))
								request(Github.delete(`${PR.issue_url}/labels/%24%24qa`))

							} else {
								const unresolved = uniqueTickets.length - resolved.length
								request(Github.post(`${PR.head.repo.url}/statuses/${sha}`, {
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

export default new JiraHelper()

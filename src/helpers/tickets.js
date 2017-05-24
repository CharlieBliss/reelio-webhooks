import request from 'request'
import rp from 'request-promise'
import moment from 'moment'

import { uniqueTicketFilter } from '../helpers/utils'
import { jiraRegex } from '../consts'

import Github from '../helpers/github'
import Firebase from '../helpers/firebase'
import Jira from './jira'
import Slack from '../helpers/slack'


class Tickets {

	formatTicketData(responses = [], repo) {
		return responses.map((ticket) => {
			const assignee = ticket.fields.assignee || null

			return {
				name: ticket.key,
				assignee: assignee ? assignee.displayName : 'not provided',
				reporter: ticket.fields.reporter.displayName || 'not provided',
				points: ticket.fields.customfield_10004 || 'not provided',
				repository: repo,
			}
		})
	}

	getTicketFirebaseInfo(ticket, repo, logData) {
		const ticketBase = 'https://reelio.atlassian.net/rest/api/2/issue'
		let firebaseInfo

		rp(Jira.get(`${ticketBase}/${ticket}`))
		.then((response) => {
			const ticketInfo = (JSON.parse(response))
			const board = ticketInfo.fields.project.key
			const assignee = ticketInfo.fields.assignee || null

			firebaseInfo = {
				name: ticketInfo.key || 'not provided',
				assignee: assignee ? assignee.displayName : 'not provided',
				reporter: ticketInfo.fields.reporter.displayName || 'not provided',
				points: ticketInfo.fields.customfield_10004 || 'not provided',
				repository: repo,
			}

			return logData(board, firebaseInfo)
		})
	}

	transitionTickets(tickets, payload) {
		const head = payload.pull_request.head.ref
		const parsedBranch = head.substr(head.indexOf('-') + 1, head.length)
		const repo = payload.repository.html_url

		tickets.forEach((ticket) => {
			const ticketUrl = `https://reelio.atlassian.net/rest/api/2/issue/${ticket}`,
				table = `|| Deployed On || PR API || PR Human || Deployed || QA Approved || \n || ${moment().format('l')} || [(internal use)|${payload.pull_request.url}] || [${payload.pull_request.number}|${payload.pull_request.html_url}] || [Yes|http://zzz-${parsedBranch}.s3-website-us-east-1.amazonaws.com/] || ||`

			// Make sure the ticket is marked as `Ready for QA`
			request(Jira.post(`${ticketUrl}/transitions`, {
				transition: {
					id: 221,
				},
			}))

			this.getTicketFirebaseInfo(ticket, repo, (board, data) => {
				Firebase.log('JIRA', board, 'transition', 'QA', { ticket: data })
			})
			// Update the ticket with our new table
			request(Jira.put(`${ticketUrl}`, {
				fields: {
					customfield_10900: table,
				},
			}), (_, __, resBody) => {
				if (!resBody) {
					this.getTicketFirebaseInfo(ticket, repo, (board, data) => {
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

	checkTicketStatus(pullRequestRoute, labels = true) {
		request(Github.get(pullRequestRoute), (err, res, resBody) => {
			const PR = JSON.parse(resBody),
				body = PR.body || '',
				tickets = body.match(jiraRegex) || [],
				uniqueTickets = tickets.filter(uniqueTicketFilter),
				sha = PR.head.sha

			if (uniqueTickets.length === 0) {
				return 'No Tickets'
			}

			const ticketBase = 'https://reelio.atlassian.net/rest/api/2/issue'
			const responses = []

				Promise.all(uniqueTickets.map(t => rp(Jira.get(`${ticketBase}/${t}`)) //eslint-disable-line
					.then((data) => {
						responses.push(JSON.parse(data))
					}),
			))
				.then(() => {
					const resolved = responses.filter(ticket => ticket.fields.status.id === '10001')
					if (resolved.length === uniqueTickets.length) {
						request(Github.post(`${PR.head.repo.url}/statuses/${sha}`, {
							state: 'success',
							description: 'All tickets marked as complete.',
							context: 'ci/qa-team',
						}))
						if (labels) {
							request(Github.post(`${PR.issue_url}/labels`, ['$$qa approved']))
							request(Github.delete(`${PR.issue_url}/labels/%24%24qa`))
						}
					} else {
						const unresolved = uniqueTickets.length - resolved.length
						request(Github.post(`${PR.head.repo.url}/statuses/${sha}`, {
							state: 'failure',
							description: `Waiting on ${unresolved} ticket${unresolved > 1 ? 's' : ''} to be marked as "done".`,
							context: 'ci/qa-team',
						}))
						if (labels) {
							request(Github.post(`${PR.issue_url}/labels`, ['$$qa']))
							request(Github.delete(`${PR.issue_url}/labels/%24%24qa%20approved`))
						}
					}
				})
			return 'Ticket Status updated'
		})
	}
}

export default new Tickets()

import request from 'request'
import moment from 'moment'

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

		request(Jira.get(`${ticketBase}/${ticket}`, 'jira'), (_, __, data) => {
			const ticketInfo = (JSON.parse(data))
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
}

export default new Tickets()

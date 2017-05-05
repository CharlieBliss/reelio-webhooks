import moment from 'moment'
import request from 'request'

import Slack from '../helpers/slack'
import Firebase from '../helpers/firebase'
import Tickets from '../helpers/tickets'

import { JIRA_TOKEN } from '../consts'

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
}

export default new JiraHelper()

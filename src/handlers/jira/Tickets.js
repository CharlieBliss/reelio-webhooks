import request from 'request'
import Jira from '../../helpers/jira'

class Tickets {

	getTicketResponses(responses, tickets, attempts, repo, logData) {
		let formattedTickets
		if (
			responses.length < tickets.length &&
			attempts < 20
		) {
			setTimeout(() => {
				this.getTicketResponses(responses, tickets, attempts, repo, logData)
				attempts += 1
				console.log('LOOPING', responses.length, attempts)
			}, 1000)

		} else {
			formattedTickets = responses.map(ticket => (
				{
					name: ticket.key,
					assignee: ticket.fields.assignee.displayName || 'not provided',
					reporter: ticket.fields.reporter.displayName || 'not provided',
					points: ticket.fields.customfield_10004 || 'not provided',
					repository: repo,
				}
			),
			)
			return logData(formattedTickets)
		}
		return 'No Tickets'
	}

	getTicketFirebaseInfo(ticket, repo, logData) {
		const ticketBase = 'https://reelio.atlassian.net/rest/api/2/issue'
		let firebaseInfo

		request(Jira.get(`${ticketBase}/${ticket}`, 'jira'), (_, __, data) => {
			const ticketInfo = (JSON.parse(data))
			const board = ticketInfo.fields.project.key
			firebaseInfo = {
				name: ticketInfo.key || 'not provided',
				assignee: ticketInfo.fields.assignee.displayName || 'not provided',
				reporter: ticketInfo.fields.reporter.displayName || 'not provided',
				points: ticketInfo.fields.customfield_10004 || 'not provided',
				repository: repo,
			}

			return logData(board, firebaseInfo)
		})
	}
}

export default new Tickets()

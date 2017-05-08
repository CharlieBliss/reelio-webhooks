import Slack from '../../helpers/slack'
import Github from '../../helpers/github'
import Jira from '../../helpers/jira'
import { uniqueTicketFilter } from '../../helpers/utils'
import { jiraRegex } from '../../consts'

const request = require('request')
const rp = require('request-promise')

export function Transition(payload) {

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

				Promise.all(tickets.map(t => rp(Jira.get(`${ticketBase}/${t}`)) //eslint-disable-line
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
				})
			}
		})
	}
	return 'PR status updated'
}

export default Transition

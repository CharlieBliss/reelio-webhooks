import Tickets from '../../helpers/tickets'
import { GITHUB_BOT_ID } from '../../consts'


function CheckTickets(payload, event, status) {
	const action = payload.action

	const actions = ['opened', 'edited', 'reopened', 'synchronize']

	// We don't want to run this check on things like PR closed
	if (event === 'pull_request' && !actions.includes(action)) {
		return 'Invalid Action'
	}

	const prUrl = payload.pull_request.url

	// Skip PRs that don't need reviews.
	if (payload.pull_request.user.id.toString() === GITHUB_BOT_ID) {
		return 'Devops Branch'
	}

	// Check to see what status all the tickets in this PR are in.
	if (status) {
		Tickets.checkTicketStatus(prUrl, false, status)
	}
}

export default CheckTickets

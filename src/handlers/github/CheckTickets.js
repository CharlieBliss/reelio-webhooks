import Tickets from '../../helpers/tickets'

function CheckTickets(payload, event) {
	const action = payload.action
	const base = payload.pull_request.base.ref

	const actions = ['opened', 'edited', 'reopened', 'synchronize']

	// We don't want to run this check on things like PR closed
	if (event === 'pull_request' && !actions.includes(action)) {
		return 'Invalid Action'
	}

	const prUrl = payload.pull_request.url

	// Skip PRs that don't need reviews.
	if (base.includes('master')) {
		return 'Master Branch'
	}

	Tickets.checkTicketStatus(prUrl, false)

}


export default CheckTickets

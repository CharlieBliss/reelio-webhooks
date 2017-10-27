import Tickets from '../../helpers/tickets'

// If a ticket is moved to "done" check the associated PR to update the PR status check.
export function Transition(payload) {

	// GOOD Transition ID = 51
	// if transition.id !== 51, status = declined
	if (payload.transition.transitionId === 51) {
		const TicketTable = payload.issue.fields.customfield_10900 || payload.fields.customfield_10900

		const PRRoute = TicketTable.match(/\[\(internal use\)\|([^\]]*)\]/)[1]

		Tickets.checkTicketStatus(PRRoute)

	}
	return 'PR status updated'
}

export default Transition

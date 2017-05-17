import Slack from '../../helpers/slack'
import Tickets from '../../helpers/tickets'

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

		Tickets.checkTicketStatus(PRRoute)

	}
	return 'PR status updated'
}

export default Transition

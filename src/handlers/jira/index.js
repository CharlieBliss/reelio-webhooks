import helper from '../../helpers/jira'

import IssueUpdate from './IssueUpdate'
import Transition from './Transition'

export function handle(event, context, callback) {
	const payload = JSON.parse(event.body)

	// Generic issue change handler
	if (
		payload &&
		payload.webhookEvent === 'jira:issue_updated' &&
		payload.changelog
	) {
		const response = IssueUpdate(payload)

		return callback(null, helper.respond(response, 200))
	}

	if (payload && payload.transition) {
		Transition(payload)
		return callback(null, helper.respond('Handling transition', 200))
	}

	return callback(null, helper.respond('Event not handled', 200))
}

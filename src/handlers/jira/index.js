import helper from '../../helpers/jira'
import Transition from './Transition'

export function handle(event, context, callback) {
	const payload = JSON.parse(event.body)

	if (payload && payload.transition) {
		Transition(payload)
		return callback(null, helper.respond('Handling transition', 200))
	}

	return callback(null, helper.respond('Event not handled', 200))
}

import Transition from './Transition'
import helper from '../../helpers/jira'

export function handle(event, context, callback) {
	const payload = JSON.parse(event.body)

	if (payload && payload.transition) {
		return callback(null, Transition(payload))
	}

	return callback(null, helper.respond('Not a valid JIRA event.', 400))
}

import helper from '../../helpers/jira'
import Transition from './Transition'

export function handle(event, context, callback) {
	const payload = JSON.parse(event.body)

	if (payload && payload.transition) {
		Transition(payload)
	}

	return callback(null, helper.respond('Not a valid JIRA event.', 400))
}

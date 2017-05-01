import helper from '../../helpers/jira'

export function handle(event, context, callback) {
	console.log('hey we made it')
	const payload = JSON.parse(event.body)

	if (payload && payload.transition) {
		return helper.handleTransition(payload)
	}

	return callback(null, helper.respond('No Actions Taken'))

}

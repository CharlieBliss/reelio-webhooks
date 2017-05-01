import helper from '../../helpers/jira'

export function jira(event, context, callback) {
	const payload = JSON.parse(event.body)

	if (payload && payload.transition) {
		return (helper.handleTransition(payload))
	}

	return callback(null, null, helper.respond('No Actions Taken'))

	// Use this code if you don't use the http event with the LAMBDA-PROXY integration
	// callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
}

import helper from '../../helpers/jira'

export function handle(event, context, callback) {
	console.log('hey we made it')

	return callback(null, helper.respond('No Actions Taken'))

	// Use this code if you don't use the http event with the LAMBDA-PROXY integration
	// callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
}

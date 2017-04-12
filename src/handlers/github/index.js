import helper from '../../helpers/github'
import Review from './Review'

export function handle(event, context, callback) {
	const headers = event.headers,
		githubEvent = headers['X-Github-Event'],
		payload = JSON.parse(event.body),
		action = payload.action

	/* eslint-disable */
	// console.log('---------------------------------');
	// console.log(`Github-Event: "${githubEvent}" with action: "${action}"`);
	// console.log('---------------------------------');
	/* eslint-enable */

	if (!githubEvent) {
		return callback(null, helper.respond('Not a valid github event.', 400))
	}

	if (!action) {
		return callback(null, helper.respond('No action given.', 400))
	}

	if (githubEvent === 'pull_request_review') {
		return callback(null, helper.respond(Review(event, payload)))

		// if (get(config, [org, repo, 'pull_request_review', 'enabled'])) {
		// }
	}

	return callback(null, helper.respond('No actions taken.'))
}

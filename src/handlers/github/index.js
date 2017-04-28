import helper from '../../helpers/github'
import Review from './Review'
import CheckReviews from './CheckReviews'
import Labels from '../Labels'
import PullRequest from './PullRequest'

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

	if (
		event === 'pull_request' ||
		event === 'pull_request_review'
	) {
		// Doesn't reply because we don't want to call it twice.
		// if (get(config, [org, repo, 'require_reviews', 'enabled'])) {
		// CheckReviews(payload, get(config, [org, repo, 'require_reviews', 'count']))
		CheckReviews(payload, event)
		// }
	}

	if (event === 'pull_request') {
		// if (get(config, [org, repo, 'pull_request', 'enabled'])) {
		PullRequest(payload)
		// }
	}

	if (event === 'pull_request_review') {
		// if (get(config, [org, repo, 'pull_request_review', 'enabled'])) {
		Review(payload)
		// }
	}

	if (event === 'label') {
		Labels(payload)
	}

	if (githubEvent === 'pull_request_review') {
		return callback(null, helper.respond(Review(payload)))

		// if (get(config, [org, repo, 'pull_request_review', 'enabled'])) {
		// }
	}

	return callback(null, helper.respond('No actions taken.'))
}

import Review from './Review'
import CheckReviews from './CheckReviews'
import Labels from './Labels'
import PullRequest from './PullRequest'

import helper from '../../helpers/github'
// import firebase from '../../helpers/firebase'


export function handle(event, context, callback) {

	const headers = event.headers,
		githubEvent = headers['X-GitHub-Event'] || headers['X-Github-Event'],
		payload = JSON.parse(event.body),
		action = payload.action

	// const fullRepo = payload.repository.full_name
		// org = fullRepo.split('/')[0],
		// repo = fullRepo.split('/')[1]

	/* eslint-disable */
	console.log('---------------------------------');
	console.log(`Github-Event: "${githubEvent}" with action: "${action}"`);
	console.log('---------------------------------');
	/* eslint-enable */

	// firebase.log('github', fullRepo, githubEvent, action, payload)

	if (!githubEvent) {
		return callback(null, helper.respond('Not a valid github event.', 400))
	}

	if (!action) {
		return callback(null, helper.respond('No action given.', 400))
	}

	if (
		githubEvent === 'pull_request' ||
		githubEvent === 'pull_request_review'
	) {
		CheckReviews(payload)
	}

	if (githubEvent === 'pull_request') {
		// if (get(config, [org, repo, 'pull_request', 'enabled'])) {
		return callback(null, helper.respond(PullRequest(payload)))
		// }
	}

	if (githubEvent === 'label') {
		return callback(null, helper.respond(Labels(payload)))
	}

	if (githubEvent === 'pull_request_review') {
		return callback(null, helper.respond(Review(payload)))

		// if (get(config, [org, repo, 'pull_request_review', 'enabled'])) {
		// }
	}

	return callback(null, helper.respond('No actions taken.'))
}

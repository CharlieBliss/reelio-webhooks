import nock from 'nock'

export const firebasePRWithAction = () => (
	nock('https://webhooks-front.firebaseio.com')
		.filteringPath(function(path) {
			return '/test/webhook-test/pull_request/opened/';
		})
		.put(`/test/webhook-test/pull_request/opened/`)
		.reply(200)
)

export const firebasePRNoAction = () => (
	nock('https://webhooks-front.firebaseio.com')
		.filteringPath(function(path) {
			return '/test/webhook-test/pull_request/';
		})
		.put(`/test/webhook-test/pull_request/`)
		.reply(200)
)

export const genericFirebaseLog = (times = 1) => (
	nock('https://webhooks-front.firebaseio.com')
		.filteringPath(function(path) {
			return '';
		})
		.put('').times(times)
		.reply(200)
)

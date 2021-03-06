import nock from 'nock'
import * as payloads from '../payloads/github'

export const conflictingPull = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1')
		.reply(200, payloads.pullRequest.pullRequestWithConflicts)
)

export const conflictingPull2 = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/2')
		.reply(200, payloads.pullRequest.pullRequestWithConflicts2)
)

export const featurelessPR = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1')
		.reply(200, payloads.pullRequest.pullRequestFeatureless.pull_request)
)

export const genericMasterPR = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1')
		.reply(200, payloads.pullRequest.pullRequestOpenedMaster.pull_request)
)

export const genericStagingPR = () => (
	nock('https://api.github.com')
		.get("/repos/test/test/pulls/1").times(1)
		.reply(200, payloads.pullRequest.pullRequestOpenedStaging.pull_request)
)

export const mergeablePull = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1')
		.reply(200, payloads.pullRequest.pullRequestMergeable)
)

//the next two payloads should definitely be consolidated
export const stagingPRMultiTickets = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1')
		.reply(200, payloads.pullRequest.pullRequestMultiTickets.pull_request)
)

export const stagingMultiTicketsPR = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1')
		.reply(200, payloads.pullRequest.stagingMultiTicketsPR.pull_request)
)

export const stagingPRMultiTicketsUnapproved = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1')
		.reply(200, payloads.pullRequest.pullRequestMultiTicketsUnapproved.pull_request)
)

export const ticketlessAndFeaturelessPR = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1')
		.reply(200, payloads.pullRequest.ticketAndFeatureless.pull_request)
)

export const ticketlessPR = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1')
		.reply(200, payloads.pullRequest.pullRequestTicketless.pull_request)
)

export const createPullRequest = () => (
	nock('https://api.github.com')
		.post('/repos/test/test/pulls')
		.reply(200, {"number": "1"})
)

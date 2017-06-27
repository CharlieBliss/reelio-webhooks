import nock from 'nock'
import * as payloads from '../payloads/github'

// comments

export const featureBranchComment = () => (
	nock('https://api.github.com')
		.post('/repos/test/test/issues/1/comments')
		.reply(200)
)

export const featurelessComment = () => (
	nock('https://api.github.com')
	.post('/repos/test/test/issues/1/comments',
		{ body: `@Kyle-Mendes - It looks like your branch doesn't contain \`feature-\`.  Are you sure this PR shouldn't be a feature branch?`
		})
	.reply(200)
)

export const ticketlessComment = () => (
	nock('https://api.github.com')
		.post('/repos/test/test/issues/1/comments',
			{
				body: `@Kyle-Mendes - It looks like you didn't include JIRA ticket references in this ticket.  Are you sure you have none to reference?`
			})
		.reply(200)
)

//pulls

export const allPullsSingle = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls')
		.reply(200, payloads.pullRequest.singlePull)
)

export const allPullsMultiple = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls')
		.reply(200, payloads.pullRequest.multiplePulls)
)

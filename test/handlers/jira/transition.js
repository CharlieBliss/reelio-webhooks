const nock = require('nock')
const mod = require('../../../src/handlers/jira')
const mochaPlugin = require('serverless-mocha-plugin')

const headers = require('../../payloads/headers')
const githubPayloads = require('../../payloads/github')
const jiraPayloads = require('../../payloads/jira')

const lambdaWrapper = mochaPlugin.lambdaWrapper;
const expect = mochaPlugin.chai.expect;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' })

export function Transition() {
	describe('Transition', () => {
		beforeEach(() => {
			nock.cleanAll()
		})

		it('Handles Jira transition Event (2+ approved reviews)', (done) => {
			const request = Object.assign({}, { headers: headers.jira }, { body: JSON.stringify(jiraPayloads.transition.qaToDone) })

			const sha = githubPayloads.pullRequest.pullRequestMultiTickets.pull_request.head.sha

			const PRRoute = nock('https://api.github.com')
				.get('/repos/dillonmcroberts/Webhook-test/pulls/26')
				.reply(200, githubPayloads.pullRequest.pullRequestMultiTickets.pull_request)

			const successCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`)
				.reply(200)

			const removeQA = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24qa')
				.reply(200)

			const addQAApproved = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$qa approved'])
				.reply(200)

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(PRRoute.isDone()).to.be.true
					expect(successCI.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(addQAApproved.isDone()).to.be.true
					done()
				}, 1500)
			})
		})

		it('Handles Jira transition Event (1 approved review)', (done) => {
			const request = Object.assign({}, { headers: headers.jira }, { body: JSON.stringify(jiraPayloads.transition.qaToDone) })

			const sha = githubPayloads.pullRequest.pullRequestMultiTicketsUnapproved.pull_request.head.sha

			const addQA = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ["$$qa"])
				.reply(200)

			const removeQAApproved = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24qa%20approved')
				.reply(200)

			const PRRoute = nock('https://api.github.com')
			.get('/repos/dillonmcroberts/Webhook-test/pulls/26')
			.reply(200, githubPayloads.pullRequest.pullRequestMultiTicketsUnapproved.pull_request)

			const failureCI = nock('https://api.github.com')
			.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
				{
					state: 'failure',
					description: `Waiting on 1 ticket to be marked as "done".`,
					context: 'ci/qa-team',
				})
			.reply(200)

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(PRRoute.isDone()).to.be.true
					expect(addQA.isDone()).to.be.true
					expect(removeQAApproved.isDone()).to.be.true
					expect(failureCI.isDone()).to.be.true
					done()
				}, 1500)
			})
		})

		it('Handles Jira transition Event (Single Ticket)', (done) => {
			const request = Object.assign({}, { headers: headers.jira }, { body: JSON.stringify(jiraPayloads.transition.qaToDone) })

			const sha = githubPayloads.pullRequest.pullRequestOpenedStaging.pull_request.head.sha

			const PRRoute = nock('https://api.github.com')
				.get('/repos/dillonmcroberts/Webhook-test/pulls/26')
				.reply(200, githubPayloads.pullRequest.pullRequestOpenedStaging.pull_request)

			const successCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`)
				.reply(200)

			const removeQA = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24qa')
				.reply(200)

			const add = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$qa approved'])
				.reply(200)

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(PRRoute.isDone()).to.be.true
					expect(successCI.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(add.isDone()).to.be.true
					done()
				}, 1500)
			})
		})

	})
}

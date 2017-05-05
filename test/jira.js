const nock = require('nock')
const mod = require('../src/handlers/jira')
const mochaPlugin = require('serverless-mocha-plugin')

const headers = require('./payloads/headers')
const githubPayloads = require('./payloads/github')
const jiraPayloads = require('./payloads/jira')

const lambdaWrapper = mochaPlugin.lambdaWrapper;
const expect = mochaPlugin.chai.expect;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' })

describe('jira', () => {
	beforeEach(() => {
		nock.cleanAll()
	})

	it('Returns 400 for no jira event', (done) => {
		const request = Object.assign({}, { headers: headers.jira }, { body: githubPayloads.review.approved })

		wrapped.run(request).then((response) => {
			setTimeout(() => {
				expect(response).to.not.be.empty
				expect(response.body).to.equal('Jira -- Not a valid JIRA event.')
				expect(response.statusCode).to.equal(400)
				done()
			}, 10)
		})
	})

	it('Handles Jira transition Event', (done) => {
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
			}, 10)
		})
	})
})

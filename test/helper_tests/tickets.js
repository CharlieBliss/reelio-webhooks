const expect = require('chai').expect
const nock = require('nock')

const Tickets = require('../../src/helpers/tickets').default
const Jira = require('../../src/helpers/jira').default

const jiraPayloads = require('../payloads/jira')
const githubPayloads = require('../payloads/github')

const consts = require('../../src/consts/slack')



describe('helpers -- tickets', () => {
	beforeEach(() => {
		nock.cleanAll()
	})

	it('Should handle JIRA ticket transitions from QA => Done (single ticket)', (done) => {
		Jira.handleTransition(jiraPayloads.transition.qaToDone)

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

		setTimeout(() => {
			expect(PRRoute.isDone()).to.be.true
			expect(successCI.isDone()).to.be.true
			expect(removeQA.isDone()).to.be.true
			expect(addQAApproved.isDone()).to.be.true
			expect(Jira.handleTransition(jiraPayloads.transition.qaToDone)).to.equal('PR status updated')
			done()
		}, 10)
	})

	it('Should handle JIRA ticket transitions from QA => Done (multiple tickets, all approved)', (done) => {
		Jira.handleTransition(jiraPayloads.transition.qaToDone)

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

		setTimeout(() => {
			expect(PRRoute.isDone()).to.be.true
			expect(successCI.isDone()).to.be.true
			expect(removeQA.isDone()).to.be.true
			expect(addQAApproved.isDone()).to.be.true
			expect(Jira.handleTransition(jiraPayloads.transition.qaToDoneSingle)).to.equal('PR status updated')
			done()
		}, 10)
	})

})

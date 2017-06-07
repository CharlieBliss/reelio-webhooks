const nock = require('nock')
const mod = require('../../../src/handlers/jira')
const mochaPlugin = require('serverless-mocha-plugin')

const headers = require('../../payloads/headers')
const githubPayloads = require('../../payloads/github')
const jiraPayloads = require('../../payloads/jira')
const nocks = require('../../nocks')

const lambdaWrapper = mochaPlugin.lambdaWrapper;
const expect = mochaPlugin.chai.expect;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' })

export function Transition() {
	describe('Transition', () => {
		beforeEach(() => {
			nock.cleanAll()
			nock.disableNetConnect()
		})

		it('Handles Jira transition Event (2+ approved reviews)', (done) => {
			const sha = githubPayloads.pullRequest.pullRequestMultiTickets.pull_request.head.sha

			const PRRoute = nocks.pull_request.stagingPRMultiTickets()
			const successCI = nocks.status.genericStatus(sha)
			const removeQA = nocks.labels.removeQA()
			const addQAApproved = nocks.labels.addQAApproved()
			const ticketResponse = nocks.jira.resolvedTicket1()
			const ticketResponse2 = nocks.jira.resolvedTicket2()

			const request = Object.assign({}, { headers: headers.jira }, { body: JSON.stringify(jiraPayloads.transition.qaToDone) })
			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(PRRoute.isDone()).to.be.true
					expect(successCI.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(addQAApproved.isDone()).to.be.true
					expect(addQAApproved.isDone()).to.be.true
					expect(ticketResponse.isDone()).to.be.true
					expect(ticketResponse2.isDone()).to.be.true
					done()
				}, 50)
			})
		})

		it('Handles Jira transition Event (1 approved review)', (done) => {
			const sha = githubPayloads.pullRequest.pullRequestMultiTicketsUnapproved.pull_request.head.sha

			const PRRoute = nocks.pull_request.stagingPRMultiTicketsUnapproved()
			const addQA = nocks.labels.addQA()
			const removeQAApproved = nocks.labels.removeQAApproved()
			const failureCI = nocks.status.QAWaitingOn1(sha)
			const ticketResponse = nocks.jira.resolvedTicket1()
			const ticketResponse2 = nocks.jira.unresolvedTicket()

			const request = Object.assign({}, { headers: headers.jira }, { body: JSON.stringify(jiraPayloads.transition.qaToDone) })
			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(PRRoute.isDone()).to.be.true
					expect(addQA.isDone()).to.be.true
					expect(removeQAApproved.isDone()).to.be.true
					expect(failureCI.isDone()).to.be.true
					expect(ticketResponse.isDone()).to.be.true
					expect(ticketResponse2.isDone()).to.be.true
					done()
				}, 50)
			})
		})

		it('Handles Jira transition Event (Single Ticket)', (done) => {
			const sha = githubPayloads.pullRequest.pullRequestOpenedStaging.pull_request.head.sha

			const PRRoute = nocks.pull_request.genericStagingPR()
			const successCI = nocks.status.genericStatus(sha)
			const removeQA = nocks.labels.removeQA()
			const addQAApproved = nocks.labels.addQAApproved()
			const ticketResponse = nocks.jira.resolvedTicket1()

			const request = Object.assign({}, { headers: headers.jira }, { body: JSON.stringify(jiraPayloads.transition.qaToDone) })
			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(PRRoute.isDone()).to.be.true
					expect(successCI.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(addQAApproved.isDone()).to.be.true
					expect(ticketResponse.isDone()).to.be.true
					done()
				}, 30)
			})
		})

	})
}

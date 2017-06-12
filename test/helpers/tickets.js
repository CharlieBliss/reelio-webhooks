const expect = require('chai').expect
const nock = require('nock')

const Tickets = require('../../src/helpers/tickets').default
const Jira = require('../../src/helpers/jira').default

import Transition from '../../src/handlers/jira/Transition'

const jiraPayloads = require('../payloads/jira')
const githubPayloads = require('../payloads/github')
const nocks = require('../nocks')

const consts = require('../../src/consts/slack')

describe('helpers -- tickets', () => {
	beforeEach(() => {
		nock.cleanAll()
		nock.disableNetConnect()
	})

	it('Should handle JIRA ticket transitions from QA => Done (single ticket)', (done) => {
		Transition(jiraPayloads.transition.qaToDone)

		const sha = githubPayloads.pullRequest.pullRequestOpenedStaging.pull_request.head.sha
		const PRRoute = nocks.pull_request.genericStagingPR()
		const successCI = nocks.status.genericStatus(sha)
		const removeQA = nocks.labels.removeQA()
		const addQAApproved = nocks.labels.addQAApproved()
		const ticketResponse = nocks.jira.resolvedTicket1()

		setTimeout(() => {
			expect(PRRoute.isDone()).to.be.true
			expect(successCI.isDone()).to.be.true
			expect(removeQA.isDone()).to.be.true
			expect(addQAApproved.isDone()).to.be.true
			expect(ticketResponse.isDone()).to.be.true
			expect(Transition(jiraPayloads.transition.qaToDone)).to.equal('PR status updated')
			done()
		}, 1500)
	})

	it('Should handle JIRA ticket transitions from QA => Done (multiple tickets, all approved)', (done) => {

		const sha = githubPayloads.pullRequest.pullRequestMultiTickets.pull_request.head.sha
		const PRRoute = nocks.pull_request.stagingMultiTicketsPR()
		const successCI = nocks.status.genericStatus(sha)
		const removeQA = nocks.labels.removeQA()
		const addQAApproved = nocks.labels.addQAApproved()
		const ticketResponse = nocks.jira.resolvedTicket1()
		const ticketResponse2 = nocks.jira.resolvedTicket2()

		Transition(jiraPayloads.transition.qaToDone)
		setTimeout(() => {
			expect(PRRoute.isDone()).to.be.true
			expect(successCI.isDone()).to.be.true
			expect(removeQA.isDone()).to.be.true
			expect(addQAApproved.isDone()).to.be.true
			expect(ticketResponse.isDone()).to.be.true
			expect(ticketResponse2.isDone()).to.be.true
			done()
		}, 1500)
	})

	it('Should handle JIRA ticket transitions from QA => Done (multiple tickets, not approved)', (done) => {

		const sha = githubPayloads.pullRequest.pullRequestMultiTicketsUnapproved.pull_request.head.sha
		const addQA = nocks.labels.addQA()
		const removeQAApproved = nocks.labels.removeQAApproved()
		const PRRoute = nocks.pull_request.stagingPRMultiTicketsUnapproved()
		const failureCI = nocks.status.QAWaitingOn1(sha)
		const ticketResponse = nocks.jira.resolvedTicket1()
		const unresolvedTicket = nocks.jira.unresolvedTicket()

		Transition(jiraPayloads.transition.qaToDone)
		setTimeout(() => {
			expect(PRRoute.isDone()).to.be.true
			expect(addQA.isDone()).to.be.true
			expect(removeQAApproved.isDone()).to.be.true
			expect(failureCI.isDone()).to.be.true
			expect(ticketResponse.isDone()).to.be.true
			expect(unresolvedTicket.isDone()).to.be.true
			done()
		}, 1500)
	})

})

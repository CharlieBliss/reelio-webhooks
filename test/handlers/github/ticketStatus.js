const mochaPlugin = require('serverless-mocha-plugin')
const mod = require('../../../src/handlers/github')
const nock = require('nock')

const lambdaWrapper = mochaPlugin.lambdaWrapper
const expect = mochaPlugin.chai.expect
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' })

const headers = require('../../payloads/headers')
const githubPayloads = require('../../payloads/github')
const jiraPayloads = require('../../payloads/jira')
const nocks = require('../../nocks')
const CheckReviews = require('../../../src/handlers/github/CheckReviews').default

export function TicketStatus() {
	describe('Check PR Ticket Status', () => {
		beforeEach(() => {
			nock.cleanAll()
			nock.disableNetConnect()
		})

		it('Returns ci/qa-team failure for single Ticket', (done) => {
			let payload = githubPayloads.pullRequest.pullRequestOpenedStaging
			const sha = payload.pull_request.head.sha

			const issue = nocks.issues.genericIssue()
			const reviews = nocks.reviews.noReviews()
			const PRRoute = nocks.pull_request.genericStagingPR()
			const failureCI = nocks.status.failureWaitingOnTwoReviews(sha)
			const failureQACI = nocks.status.QAWaitingOn1(sha)
			const ticketData = nocks.jira.genericTicketData(3)
			const addReview = nocks.labels.addReview()
			const removeQA = nocks.labels.removeQA()
			const removeApproved = nocks.labels.removeApproved()
			const featureBranchComment = nocks.github.featureBranchComment()
			const transition = nocks.jira.autoTransition()
			const firebaseLog = nocks.firebase.genericFirebaseLog(2)

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(payload) })
			request.headers['X-Github-Event'] = 'pull_request'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(issue.isDone()).to.be.true
					expect(reviews.isDone()).to.be.true
					expect(PRRoute.isDone()).to.be.true
					expect(failureCI.isDone()).to.be.true
					expect(failureQACI.isDone()).to.be.true
					expect(ticketData.isDone()).to.be.true
					expect(addReview.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(removeApproved.isDone()).to.be.true
					expect(featureBranchComment.isDone()).to.be.true
					expect(transition.isDone()).to.be.true
					expect(firebaseLog.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 1500)
			})
		})

		it('Returns ci/qa-team failure (with proper message) when waiting on 2 unresolved tickets', (done) => {
			let payload = githubPayloads.pullRequest.stagingMultiTicketsPR
			const sha = payload.pull_request.head.sha

			const issue = nocks.issues.genericIssue()
			const reviews = nocks.reviews.noReviews()
			const PRRoute = nocks.pull_request.stagingMultiTicketsPR()
			const firebaseLog = nocks.firebase.genericFirebaseLog(2)
			const failureCI = nocks.status.failureWaitingOnTwoReviews(sha)
			const qaFailureCI = nocks.status.QAWaitingOn2(sha)
			const ticketResponse = nocks.jira.genericTicketData(3)
			const ticketResponse2 = nocks.jira.xyz3TicketData(3)
			const featureBranchComment = nocks.github.featureBranchComment()
			const addReview = nocks.labels.addReview()
			const removeQA = nocks.labels.removeQA()
			const removeApproved = nocks.labels.removeApproved()
			const transition = nocks.jira.autoTransition()
			const transition2 = nocks.jira.autoTransition2()

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(payload) })
			request.headers['X-Github-Event'] = 'pull_request'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(issue.isDone()).to.be.true
					expect(reviews.isDone()).to.be.true
					expect(PRRoute.isDone()).to.be.true
					expect(firebaseLog.isDone()).to.be.true
					expect(failureCI.isDone()).to.be.true
					expect(qaFailureCI.isDone()).to.be.true
					expect(ticketResponse.isDone()).to.be.true
					expect(ticketResponse2.isDone()).to.be.true
					expect(featureBranchComment.isDone()).to.be.true
					expect(addReview.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(removeApproved.isDone()).to.be.true
					expect(transition.isDone()).to.be.true
					expect(transition2.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 1500)
			})
		})

		it('Returns ci/qa-team failure (with proper message) when waiting on 1 unresolved ticket', (done) => {
			let payload = githubPayloads.pullRequest.stagingMultiTicketsPR
			const sha = payload.pull_request.head.sha

			const issue = nocks.issues.genericIssue()
			const reviews = nocks.reviews.noReviews()
			const PRRoute = nocks.pull_request.stagingMultiTicketsPR()
			const firebaseLog = nocks.firebase.genericFirebaseLog(2)
			const failureCI = nocks.status.failureWaitingOnTwoReviews(sha)
			const qaFailureCI = nocks.status.QAWaitingOn1(sha)
			const ticketResponse = nocks.jira.genericTicketData(3)
			const ticketResponse2 = nocks.jira.xyz3TicketData(3)
			const featureBranchComment = nocks.github.featureBranchComment()
			const addReview = nocks.labels.addReview()
			const removeQA = nocks.labels.removeQA()
			const removeApproved = nocks.labels.removeApproved()
			const transition = nocks.jira.autoTransition()
			const transition2 = nocks.jira.autoTransition2()

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(payload) })

			request.headers['X-Github-Event'] = 'pull_request'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(issue.isDone()).to.be.true
					expect(reviews.isDone()).to.be.true
					expect(PRRoute.isDone()).to.be.true
					expect(firebaseLog.isDone()).to.be.true
					expect(failureCI.isDone()).to.be.true
					expect(qaFailureCI.isDone()).to.be.true
					expect(ticketResponse.isDone()).to.be.true
					expect(ticketResponse2.isDone()).to.be.true
					expect(featureBranchComment.isDone()).to.be.true
					expect(addReview.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(removeApproved.isDone()).to.be.true
					expect(transition.isDone()).to.be.true
					expect(transition2.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 1500)
			})
		})

		it('Returns ci/qa-team success when all tickets are resolved', (done) => {
			let payload = githubPayloads.pullRequest.stagingMultiTicketsPR
			const sha = payload.pull_request.head.sha

			const issue = nocks.issues.genericIssue()
			const reviews = nocks.reviews.noReviews()
			const PRRoute = nocks.pull_request.stagingMultiTicketsPR()
			const firebaseLog = nocks.firebase.genericFirebaseLog(2)
			const failureCI = nocks.status.failureWaitingOnTwoReviews(sha)
			const qaSuccessCI = nocks.status.QAgenericSuccess(sha)
			const ticketResponse1 = nocks.jira.resolvedTicket1(3)
			const ticketResponse2 = nocks.jira.resolvedTicket2(3)
			const featureBranchComment = nocks.github.featureBranchComment()
			const addReview = nocks.labels.addReview()
			const removeQA = nocks.labels.removeQA()
			const removeApproved = nocks.labels.removeApproved()
			const transition = nocks.jira.autoTransition()
			const transition2 = nocks.jira.autoTransition2()

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(payload) })
			request.headers['X-Github-Event'] = 'pull_request'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(issue.isDone()).to.be.true
					expect(reviews.isDone()).to.be.true
					expect(PRRoute.isDone()).to.be.true
					expect(firebaseLog.isDone()).to.be.true
					expect(failureCI.isDone()).to.be.true
					expect(qaSuccessCI.isDone()).to.be.true
					expect(ticketResponse1.isDone()).to.be.true
					expect(ticketResponse2.isDone()).to.be.true
					expect(featureBranchComment.isDone()).to.be.true
					expect(addReview.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(removeApproved.isDone()).to.be.true
					expect(transition.isDone()).to.be.true
					expect(transition2.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 1500)
			})
		})

		it('Ignores PRs into master by devops', (done) => {
			const payload = githubPayloads.pullRequest.pullRequestOpenedMasterDevops
			const sha = payload.pull_request.head.sha

			const PRRoute = nocks.pull_request.genericMasterPR()
			const issue = nocks.issues.masterIssue()
			const successCI = nocks.status.masterSuccessCI(sha)
			const firebaseLog = nocks.firebase.genericFirebaseLog()

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(payload) })
			request.headers['X-Github-Event'] = 'pull_request'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(response.statusCode).to.equal(200)
					expect(issue.isDone()).to.be.true
					expect(PRRoute.isDone()).to.be.false
					expect(successCI.isDone()).to.be.true
					expect(firebaseLog.isDone()).to.be.true
					expect(nock.pendingMocks().length).to.equal(1)
					done()
				}, 30)
			})
		})

	})
}

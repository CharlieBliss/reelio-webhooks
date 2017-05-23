const mochaPlugin = require('serverless-mocha-plugin')
const mod = require('../../../src/handlers/github')
const nock = require('nock')

const lambdaWrapper = mochaPlugin.lambdaWrapper
const expect = mochaPlugin.chai.expect
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' })

const headers = require('../../payloads/headers')
const githubPayloads = require('../../payloads/github')
const jiraPayloads = require('../../payloads/jira')
const slackUrl = require('../../../src/consts').SLACK_URL
const CheckReviews = require('../../../src/handlers/github/CheckReviews').default

export function TicketStatus() {
	describe('Check PR Ticket Status', () => {
		beforeEach(() => {
			nock.cleanAll()
		})

		it('Returns ci/qa-team success for single Ticket', (done) => {
			let payload = githubPayloads.pullRequest.pullRequestOpenedStaging
			const sha = payload.pull_request.head.sha

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/issues/1')
				.reply(200, githubPayloads.issue.genericIssue)

			const addReview = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$review'])
				.reply(200)

			const featureBranchComment = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/comments')
				.reply(200)

			const removeQA = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24qa')
				.reply(200)

			const removeApproved = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/approved')
				.reply(200)

			const PRRoute = nock('https://api.github.com')
				 .get('/repos/Kyle-Mendes/public-repo/pulls/1')
				 .reply(200, githubPayloads.pullRequest.pullRequestOpenedStaging.pull_request)

			const ticketStatus = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`).times(2)
				.reply(200, githubPayloads.status.qaCircleSuccess)

		  const getTicket = nock('https://reelio.atlassian.net')
				.get('/rest/api/2/issue/XYZ-2').times(2)
				.reply(200, jiraPayloads.ticket.genericTicketData)

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(payload) })

			request.headers['X-Github-Event'] = 'pull_request'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(reviews.isDone()).to.be.true
					expect(addReview.isDone()).to.be.true
					expect(featureBranchComment.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(removeApproved.isDone()).to.be.true
					expect(PRRoute.isDone()).to.be.true
					expect(ticketStatus.isDone()).to.be.true
					expect(getTicket.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 50)
			})
		})

		it('Returns ci/qa-team failure (with proper message) when waiting on 2 unresolved tickets', (done) => {
			let payload = githubPayloads.pullRequest.stagingMultiTicketsPR
			const sha = payload.pull_request.head.sha

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/issues/1')
				.reply(200, githubPayloads.issue.genericIssue)

			const PRRoute = nock('https://api.github.com')
			 .get('/repos/Kyle-Mendes/public-repo/pulls/1')
			 .reply(200, githubPayloads.pullRequest.stagingMultiTicketsPR.pull_request)

			const firebaseLog = nock('https://webhooks-front.firebaseio.com')
				.filteringPath(function(path) {
					return '';
				})
				.put('').times(2)
				.reply(200)

			const failureCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					{
						state: 'failure',
						description: `This PR requires 2 more approved reviews to be merged.`,
						context: 'ci/reelio',
					})
				.reply(200)

			const ticketStatus = nock("https://api.github.com")
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`)
				.reply(200, githubPayloads.status.qaWaitingOn2)

			const featureBranchComment = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/comments')
				.reply(200)

			const addReview = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$review'])
				.reply(200)

			const removeQA = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24qa')
				.reply(200)

			const removeApproved = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/approved')
				.reply(200)

			const ticketResponse = nock('https://reelio.atlassian.net')
				.get('/rest/api/2/issue/XYZ-2').times(2)
				.reply(200, jiraPayloads.ticket.genericTicketData)

			const ticketResponse2 = nock('https://reelio.atlassian.net')
				.get('/rest/api/2/issue/XYZ-3').times(2)
				.reply(200, jiraPayloads.ticket.genericTicketData)

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(payload) })

			request.headers['X-Github-Event'] = 'pull_request'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(reviews.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(removeApproved.isDone()).to.be.true
					expect(failureCI.isDone()).to.be.true
					expect(featureBranchComment.isDone()).to.be.true
					expect(addReview.isDone()).to.be.true
					expect(ticketResponse.isDone()).to.be.true
					expect(ticketResponse2.isDone()).to.be.true
					expect(ticketStatus.isDone()).to.be.true
					expect(firebaseLog.isDone()).to.be.true
					expect(PRRoute.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 50)
			})
		})

		it('Returns ci/qa-team failure (with proper message) when waiting on 1 unresolved ticket', (done) => {
			let payload = githubPayloads.pullRequest.stagingMultiTicketsPR
			const sha = payload.pull_request.head.sha

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/issues/1')
				.reply(200, githubPayloads.issue.genericIssue)

			const PRRoute = nock('https://api.github.com')
			 .get('/repos/Kyle-Mendes/public-repo/pulls/1')
			 .reply(200, githubPayloads.pullRequest.stagingMultiTicketsPR.pull_request)

			const firebaseLog = nock('https://webhooks-front.firebaseio.com')
				.filteringPath(function(path) {
					return '';
				})
				.put('').times(2)
				.reply(200)

			const failureCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					{
						state: 'failure',
						description: `This PR requires 2 more approved reviews to be merged.`,
						context: 'ci/reelio',
					})
				.reply(200)

			const ticketStatus = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`)
				.reply(200, githubPayloads.status.qaWaitingOn1)

			const featureBranchComment = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/comments')
				.reply(200)

			const addReview = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$review'])
				.reply(200)

			const removeQA = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24qa')
				.reply(200)

			const removeApproved = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/approved')
				.reply(200)

			const ticketResponse = nock('https://reelio.atlassian.net')
				.get('/rest/api/2/issue/XYZ-2').times(2)
				.reply(200, jiraPayloads.ticket.resolvedTicketData)

			const ticketResponse2 = nock('https://reelio.atlassian.net')
				.get('/rest/api/2/issue/XYZ-3').times(2)
				.reply(200, jiraPayloads.ticket.genericTicketData)

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(payload) })

			request.headers['X-Github-Event'] = 'pull_request'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(reviews.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(removeApproved.isDone()).to.be.true
					expect(failureCI.isDone()).to.be.true
					expect(featureBranchComment.isDone()).to.be.true
					expect(addReview.isDone()).to.be.true
					expect(ticketResponse.isDone()).to.be.true
					expect(ticketResponse2.isDone()).to.be.true
					expect(ticketStatus.isDone()).to.be.true
					expect(firebaseLog.isDone()).to.be.true
					expect(PRRoute.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 50)
			})
		})

		it('Returns ci/qa-team success when all tickets are resolved', (done) => {
			let payload = githubPayloads.pullRequest.stagingMultiTicketsPR
			const sha = payload.pull_request.head.sha

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/issues/1')
				.reply(200, githubPayloads.issue.genericIssue)

			const PRRoute = nock('https://api.github.com')
			 .get('/repos/Kyle-Mendes/public-repo/pulls/1')
			 .reply(200, githubPayloads.pullRequest.stagingMultiTicketsPR.pull_request)

			const firebaseLog = nock('https://webhooks-front.firebaseio.com')
				.filteringPath(function(path) {
					return '';
				})
				.put('').times(2)
				.reply(200)

			const failureCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					{
						state: 'failure',
						description: `This PR requires 2 more approved reviews to be merged.`,
						context: 'ci/reelio',
					})
				.reply(200)

			const ticketStatus = nock("https://api.github.com")
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`)
				.reply(200, githubPayloads.status.qaCircleSuccess)

			const featureBranchComment = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/comments')
				.reply(200)

			const addReview = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$review'])
				.reply(200)

			const removeQA = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24qa')
				.reply(200)

			const removeApproved = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/approved')
				.reply(200)

			const ticketResponse = nock('https://reelio.atlassian.net')
				.get('/rest/api/2/issue/XYZ-2').times(2)
				.reply(200, jiraPayloads.ticket.resolvedTicketData)

			const ticketResponse2 = nock('https://reelio.atlassian.net')
				.get('/rest/api/2/issue/XYZ-3').times(2)
				.reply(200, jiraPayloads.ticket.resolvedTicketData)

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(payload) })

			request.headers['X-Github-Event'] = 'pull_request'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(reviews.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(removeApproved.isDone()).to.be.true
					expect(failureCI.isDone()).to.be.true
					expect(featureBranchComment.isDone()).to.be.true
					expect(addReview.isDone()).to.be.true
					expect(ticketResponse.isDone()).to.be.true
					expect(ticketResponse2.isDone()).to.be.true
					expect(ticketStatus.isDone()).to.be.true
					expect(firebaseLog.isDone()).to.be.true
					expect(PRRoute.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 50)
			})
		})

		it('Ignores PRs into master', (done) => {
			const payload = githubPayloads.pullRequest.pullRequestOpenedMaster
			const sha = payload.pull_request.head.sha

			const PRRoute = nock('https://api.github.com')
			 .get('/repos/Kyle-Mendes/public-repo/pulls/1')
			 .reply(200, githubPayloads.pullRequest.pullRequestOpenedMaster.pull_request)

			 const reviews = nock('https://api.github.com')
				 .get('/repos/Kyle-Mendes/public-repo/issues/1')
				 .reply(200,
					 githubPayloads.issue.masterPR
				 )

			 const successCI = nock('https://api.github.com')
				 .post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					 {
						 state: 'success',
						 description: 'No reviews required',
						 context: 'ci/reelio',
					 })
				 .reply(200)

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(payload) })

			request.headers['X-Github-Event'] = 'pull_request'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(response.statusCode).to.equal(200)
					expect(PRRoute.isDone()).to.be.false
					expect(reviews.isDone()).to.be.true
					expect(successCI.isDone()).to.be.true
					expect(nock.pendingMocks().length).to.equal(1)
					done()
				}, 30)
			})
		})

		it('Ignores PRs when action is "closed"', (done) => {
			const payload = githubPayloads.pullRequest.pullRequestOpenedMaster
			const sha = payload.pull_request.head.sha

			const PRRoute = nock('https://api.github.com')
			 .get('/repos/Kyle-Mendes/public-repo/pulls/1')
			 .reply(200, githubPayloads.pullRequest.pullRequestOpenedMaster.pull_request)

			 const reviews = nock('https://api.github.com')
				 .get('/repos/Kyle-Mendes/public-repo/issues/1')
				 .reply(200,
					 githubPayloads.issue.masterPR
				 )

			 const successCI = nock('https://api.github.com')
				 .post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					 {
						 state: 'success',
						 description: 'No reviews required',
						 context: 'ci/reelio',
					 })
				 .reply(200)

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(payload) })

			request.headers['X-Github-Event'] = 'pull_request'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(PRRoute.isDone()).to.be.false
					expect(successCI.isDone()).to.be.true
					expect(reviews.isDone()).to.be.true
					expect(response.statusCode).to.equal(200)
					expect(nock.pendingMocks().length).to.equal(1)
					done()
				}, 30)
			})
		})

	})
}

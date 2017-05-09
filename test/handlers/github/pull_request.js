const mochaPlugin = require('serverless-mocha-plugin')
const mod = require('../../../src/handlers/github')
const nock = require('nock')

const lambdaWrapper = mochaPlugin.lambdaWrapper
const expect = mochaPlugin.chai.expect
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' })

const headers = require('../../payloads/headers')
const payloads = require('../../payloads/github')
const slackUrl = require('../../../src/consts').SLACK_URL
const CheckReviews = require('../../../src/handlers/github/CheckReviews').default


export function PullRequest() {
	describe('Handles Pull Requests', () => {
		beforeEach(() => {
			nock.cleanAll()
		})

		it('Handles PR into Master (does not create new PR)', (done) => {
			const payload = payloads.pullRequest.pullRequestOpenedMaster
			const sha = payload.pull_request.head.sha

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/issues/1')
				.reply(200,
					payloads.issue.masterPR
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
					expect(successCI.isDone()).to.be.true
					expect(reviews.isDone()).to.be.true
					expect(response.statusCode).to.equal(200)
					done()
				}, 10)
			})

		})

		it('Should warn author if PR is "ticketless"', (done) => {
			let payload = payloads.pullRequest.pullRequestTicketless
			const sha = payload.pull_request.head.sha

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/issues/1')
				.reply(200, payloads.issue.ticketless)

			const failureCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					{
						state: 'failure',
						description: `This PR requires 2 more approved reviews to be merged.`,
						context: 'ci/reelio',
					})
				.reply(200)

			const ticketlessComment = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/comments',
					{ body: `@Kyle-Mendes - It looks like you didn't include JIRA ticket references in this ticket.  Are you sure you have none to reference?`
					})
				.reply(200)

			const featureBranchComment = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/comments')
				.reply(200)
			const ticketless = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$ticketless'])
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
				expect(ticketlessComment.isDone()).to.be.true
				expect(ticketless.isDone()).to.be.true
				expect(featureBranchComment.isDone()).to.be.true
				expect(addReview.isDone()).to.be.true
				done()
			}, 50)
		})
	})

		it('Should warn author if PR is "featureless"', (done) => {
			let payload = payloads.pullRequest.pullRequestFeatureless
			const sha = payload.pull_request.head.sha

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/issues/1')
				.reply(200, payloads.issue.ticketless)

			const failureCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					{
						state: 'failure',
						description: `This PR requires 2 more approved reviews to be merged.`,
						context: 'ci/reelio',
					})
				.reply(200)

			const featureLessComment = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/comments',
					{ body: `@Kyle-Mendes - It looks like your branch doesn't contain \`feature-\`.  Are you sure this PR shouldn't be a feature branch?`
					})
				.reply(200)

			const featureBranchComment = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/comments')
				.reply(200)
			const featureless = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$featureless'])
				.reply(200)
			const ticket = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$ticketless'])
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
				expect(featureLessComment.isDone()).to.be.true
				expect(featureless.isDone()).to.be.true
				expect(featureBranchComment.isDone()).to.not.be.true
				expect(addReview.isDone()).to.be.true
				done()
			}, 50)
		})
	})

		it('Should warn author for both "Ticketless" and "Featureless" ', (done) => {
			let payload = payloads.pullRequest.ticketAndFeatureless
			const sha = payload.pull_request.head.sha

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/issues/1')
				.reply(200, payloads.issue.ticketless)

			const failureCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					{
						state: 'failure',
						description: `This PR requires 2 more approved reviews to be merged.`,
						context: 'ci/reelio',
					})
				.reply(200)

			const ticketlessComment = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/comments',
					{ body: `@Kyle-Mendes - It looks like you didn't include JIRA ticket references in this ticket.  Are you sure you have none to reference?`
					})
				.reply(200)

			const featurelessComment = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/comments',
					{ body: `@Kyle-Mendes - It looks like your branch doesn't contain \`feature-\`.  Are you sure this PR shouldn't be a feature branch?`
					})
				.reply(200)

			const featureBranchComment = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/comments')
				.reply(200)
			const featureless = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$featureless'])
				.reply(200)
			const ticketless = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$ticketless'])
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
				expect(featurelessComment.isDone()).to.be.true
				expect(featureless.isDone()).to.be.true
				expect(ticketlessComment.isDone()).to.be.true
				expect(ticketless.isDone()).to.be.true
				expect(featureBranchComment.isDone()).to.not.be.true
				expect(addReview.isDone()).to.be.true
				done()
			}, 50)
		})
	})

		it('Should properly handle a new Pull Request (single ticket)', (done) => {
			let payload = payloads.pullRequest.pullRequestOpenedStaging
			const sha = payload.pull_request.head.sha

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/issues/1')
				.reply(200, payloads.issue.ticketless)

			const jira = nock('https://reelio.atlassian.net')
				.get('/rest/api/2/issue/XYZ-2')
				.reply(200)

			const failureCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					{
						state: 'failure',
						description: `This PR requires 2 more approved reviews to be merged.`,
						context: 'ci/reelio',
					})
				.reply(200)

			const firebaseLog = nock('https://webhooks-front.firebaseio.com')
				.filteringPath(function(path) {
					 return '';
				 })
				.put('').times(2)
				.reply(200)

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
				.get('/rest/api/2/issue/XYZ-2')
				.reply(200)

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(payload) })
			request.headers['X-Github-Event'] = 'pull_request'

			wrapped.run(request).then((response) => {
			setTimeout(() => {
				expect(reviews.isDone()).to.be.true
				expect(removeQA.isDone()).to.be.true
				expect(jira.isDone()).to.be.true
				expect(removeApproved.isDone()).to.be.true
				expect(failureCI.isDone()).to.be.true
				expect(featureBranchComment.isDone()).to.be.true
				expect(addReview.isDone()).to.be.true
				expect(ticketResponse.isDone()).to.be.true
				expect(firebaseLog.isDone()).to.be.true
				done()
			}, 100)
		})
	})

		it('Should properly handle a new Pull Request (multi tickets)', (done) => {
			let payload = payloads.pullRequest.stagingMultiTicketsPR
			const sha = payload.pull_request.head.sha

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/issues/1')
				.reply(200, payloads.issue.ticketless)

			const jira = nock('https://reelio.atlassian.net')
				.get('/rest/api/2/issue/XYZ-2')
				.reply(200)

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
				.get('/rest/api/2/issue/XYZ-2')
				.reply(200)

			const ticketResponse2 = nock('https://reelio.atlassian.net')
				.get('/rest/api/2/issue/XYZ-3')
				.reply(200)

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(payload) })
			request.headers['X-Github-Event'] = 'pull_request'

			wrapped.run(request).then((response) => {
			setTimeout(() => {
				expect(reviews.isDone()).to.be.true
				expect(removeQA.isDone()).to.be.true
				expect(jira.isDone()).to.be.true
				expect(removeApproved.isDone()).to.be.true
				expect(failureCI.isDone()).to.be.true
				expect(featureBranchComment.isDone()).to.be.true
				expect(addReview.isDone()).to.be.true
				expect(ticketResponse.isDone()).to.be.true
				expect(ticketResponse2.isDone()).to.be.true
				expect(firebaseLog.isDone()).to.be.true
				done()
			}, 100)
		})
	})

	//todo

	// ALL MERGE STUFF
	// BE MORE SPECIFIC WITH FIREBASE ENDPOINTS

	})
}

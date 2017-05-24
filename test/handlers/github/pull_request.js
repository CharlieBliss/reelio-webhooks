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


export function PullRequest() {
	describe('Handles Pull Requests', () => {

		describe('Handles New Pull Request', () => {
			beforeEach(() => {
				nock.cleanAll()
			})

			it('Handles PR into Master (does not create new PR)', (done) => {
				const payload = githubPayloads.pullRequest.pullRequestOpenedMaster
				const sha = payload.pull_request.head.sha

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
						expect(successCI.isDone()).to.be.true
						expect(reviews.isDone()).to.be.true
						expect(response.statusCode).to.equal(200)
						done()
					}, 10)
				})

			})

			it('Should warn author if PR is "ticketless"', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestTicketless
				const sha = payload.pull_request.head.sha

				const reviews = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/issues/1')
					.reply(200, githubPayloads.issue.genericIssue)

				const failureCI = nock('https://api.github.com')
					.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
						{
							state: 'failure',
							description: `This PR requires 2 more approved reviews to be merged.`,
							context: 'ci/reelio',
						})
					.reply(200)

				const PRRoute = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1')
					.reply(200, githubPayloads.pullRequest.pullRequestTicketless.pull_request)

				const ticketlessComment = nock('https://api.github.com')
					.post('/repos/Kyle-Mendes/public-repo/issues/1/comments',
						{
							body: `@Kyle-Mendes - It looks like you didn't include JIRA ticket references in this ticket.  Are you sure you have none to reference?`
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
						expect(PRRoute.isDone()).to.be.true
						done()
					}, 50)
				})
			})

			it('Should warn author if PR is "featureless"', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestFeatureless
				const sha = payload.pull_request.head.sha

				const reviews = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/issues/1')
					.reply(200, githubPayloads.issue.genericIssue)

				const PRRoute = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1')
					.reply(200, githubPayloads.pullRequest.pullRequestTicketless.pull_request)

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
						expect(PRRoute.isDone()).to.be.true
						done()
					}, 50)
				})
			})

			it('Should warn author for both "Ticketless" and "Featureless" ', (done) => {
				let payload = githubPayloads.pullRequest.ticketAndFeatureless
				const sha = payload.pull_request.head.sha

				const reviews = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/issues/1')
					.reply(200, githubPayloads.issue.genericIssue)

				const PRRoute = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1')
					.reply(200, githubPayloads.pullRequest.ticketAndFeatureless.pull_request)

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

				const ticketStatus = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`)
				.reply(200, githubPayloads.status.qaCircleSuccess)
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
						expect(PRRoute.isDone()).to.be.true
						done()
					}, 50)
				})
			})

			it('Should properly handle a new Pull Request (single ticket)', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestOpenedStaging
				const sha = payload.pull_request.head.sha

				const reviews = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/issues/1')
					.reply(200, githubPayloads.issue.genericIssue)

				const PRRoute = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1')
					.reply(200, githubPayloads.pullRequest.pullRequestTicketless.pull_request)

				const ticketStatus = nock('https://api.github.com')
				 .post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`)
				 .reply(200, githubPayloads.status.qaCircleSuccess)

				const getTicket = nock('https://reelio.atlassian.net')
					.get('/rest/api/2/issue/XYZ-2')
					.reply(200, jiraPayloads.ticket.genericTicketData)

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

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })

				request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(reviews.isDone()).to.be.true
						expect(removeQA.isDone()).to.be.true
						expect(getTicket.isDone()).to.be.true
						expect(removeApproved.isDone()).to.be.true
						expect(featureBranchComment.isDone()).to.be.true
						expect(addReview.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(PRRoute.isDone()).to.be.true
						expect(ticketStatus.isDone()).to.be.true
						done()
					}, 50)
				})
			})

			it('Should properly handle a new Pull Request (multi tickets)', (done) => {
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

				const ticketStatus = nock('https://api.github.com')
					.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`).times(2)
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
						expect(featureBranchComment.isDone()).to.be.true
						expect(addReview.isDone()).to.be.true
						expect(ticketResponse.isDone()).to.be.true
						expect(ticketResponse2.isDone()).to.be.true
						expect(ticketStatus.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(PRRoute.isDone()).to.be.true
						done()
					}, 50)
				})
			})
		})

		describe('Handles Merge Pull Request', () => {
			beforeEach(() => {
				nock.cleanAll()
			})

			it('Handles Merge into Staging (with congrats slack to Dev)', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestMergedStaging
				const sha = payload.pull_request.head.sha

				const slack = nock(slackUrl)
					// times 1 double checks to make sure that a slack for merge conflicts is not sent
					.post('').times(1)
					.reply(200)

				const issue = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/issues/1')
					.reply(200, githubPayloads.issue.issue)

				const firebaseLog = nock('https://webhooks-front.firebaseio.com')
					.filteringPath(function(path) {
						return '';
					})
					.put('').times(2)
					.reply(200)

				const reviews = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1/reviews')
					.reply(200,
						[
							{ state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108742 },
							{ state: 'approved', user: { id: 25992031 }, submitted_at: 1489426108738 },
						],
					)

				const allPulls = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls')
					.reply(200, githubPayloads.pullRequest.singlePull)

				const pull = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1')
					.reply(200, githubPayloads.pullRequest.pullRequestMergeable)

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
					request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(slack.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(reviews.isDone()).to.be.true
						expect(allPulls.isDone()).to.be.true
						expect(nock.pendingMocks()).to.be.empty
						done()
					}, 50)
				})
			})

			it('Handles Merge into Staging (no congrats slack to dev)', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestMergedStaging
				const sha = payload.pull_request.head.sha

				const slack = nock(slackUrl)
					.post('')
					.reply(200)

				const issue = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/issues/1')
					.reply(200, githubPayloads.issue.issue)

				const firebaseLog = nock('https://webhooks-front.firebaseio.com')
					.filteringPath(function(path) {
						return '';
					})
					.put('')
					.reply(200)

				const reviews = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1/reviews')
					.reply(200,
						[
							{ state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108742 },
							{ state: 'approved', user: { id: 25992031 }, submitted_at: 1489426108738 },
							{ state: 'CHANGES_REQUESTED', user: { id: 6400039 }, submitted_at: 1489426108755 },
						],
					)

				const allPulls = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls')
					.reply(200, githubPayloads.pullRequest.singlePull)

				const pull = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1')
					.reply(200, githubPayloads.pullRequest.pullRequestMergeable)

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
					request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(slack.isDone()).to.not.be.true
						expect(reviews.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(allPulls.isDone()).to.be.true
						expect(pull.isDone()).to.be.true
						// should have 1 pending mock for slack message NOT sent
						expect(nock.pendingMocks()).length.to.be(1)
						done()
					}, 50)
				})
			})

			it('Warns of Merge Conflicts upon Merge (single pull with conflicts)', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestMergedStaging
				const sha = payload.pull_request.head.sha

				const slack = nock(slackUrl)
					.post('')
					.reply(200)

				const conflictWarning = nock(slackUrl)
					.post('',
						{
							channel: 'U33BK6EQJ',
							username: 'Conflict Resolution Bot',
							icon_url: 'https://octodex.github.com/images/yaktocat.png',
							text: `Hey there, Dillon. PR 123 has been flagged as having merge conflicts. Please review on <https://api.github.com/repos/Kyle-Mendes/public-repo/pulls/1|GitHub>.`,
						}
					)
					.reply(200)

				const issue = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/issues/1')
					.reply(200, githubPayloads.issue.issue)

				const firebaseLog = nock('https://webhooks-front.firebaseio.com')
					.filteringPath(function(path) {
						return '';
					})
					// logs once for merge and once for party parrot
					.put('').times(2)
					.reply(200)

				const reviews = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1/reviews')
					.reply(200,
						[
							{ state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108742 },
							{ state: 'approved', user: { id: 25992031 }, submitted_at: 1489426108738 },
						],
					)

				const allPulls = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls')
					.reply(200, githubPayloads.pullRequest.singlePull)

				const pull = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1')
					.reply(200, githubPayloads.pullRequest.pullRequestWithConflicts)

				const addRebase = nock('https://api.github.com')
					.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$rebase'])
					.reply(200)

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
					request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(slack.isDone()).to.be.true
						expect(conflictWarning.isDone()).to.be.true
						expect(reviews.isDone()).to.be.true
						expect(addRebase.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(allPulls.isDone()).to.be.true
						expect(pull.isDone()).to.be.true
						// should have 1 pending mock for slack message NOT sent
						expect(nock.pendingMocks()).to.be.empty
						done()
					}, 50)
				})
			})

			it('Warns of Merge Conflicts upon Merge (multiple pulls with conflicts)', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestMergedStaging
				const sha = payload.pull_request.head.sha

				const slack = nock(slackUrl)
					.post('')
					.reply(200)

				const conflictWarning = nock(slackUrl)
					.post('',
						{
							channel: 'U33BK6EQJ',
							username: 'Conflict Resolution Bot',
							icon_url: 'https://octodex.github.com/images/yaktocat.png',
							text: `Hey there, Dillon. PR 123 has been flagged as having merge conflicts. Please review on <https://api.github.com/repos/Kyle-Mendes/public-repo/pulls/1|GitHub>.`,
						}
					// should fire once for each PR with conflicts which is 2 for this test
					)
					.reply(200)

				const conflictWarning2 = nock(slackUrl)
					.post('',
						{
							channel: 'U33BK6EQJ',
							username: 'Conflict Resolution Bot',
							icon_url: 'https://octodex.github.com/images/yaktocat.png',
							text: `Hey there, Dillon. PR 123 has been flagged as having merge conflicts. Please review on <https://api.github.com/repos/Kyle-Mendes/public-repo/pulls/2|GitHub>.`,
						}
					// should fire once for each PR with conflicts which is 2 for this test
					)
					.reply(200)

				const issue = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/issues/1')
					.reply(200, githubPayloads.issue.issue)

				const firebaseLog = nock('https://webhooks-front.firebaseio.com')
					.filteringPath(function(path) {
						return '';
					})
					// should log once for merge and once for party parrot
					.put('').times(2)
					.reply(200)

				const reviews = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1/reviews')
					.reply(200,
						[
							{ state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108742 },
							{ state: 'approved', user: { id: 25992031 }, submitted_at: 1489426108738 },
						],
					)

				const allPulls = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls')
					.reply(200, githubPayloads.pullRequest.multiplePulls)

				const pull1 = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1')
					.reply(200, githubPayloads.pullRequest.pullRequestWithConflicts)

				const pull2 = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/2')
					.reply(200, githubPayloads.pullRequest.pullRequestWithConflicts2)

				const addRebase = nock('https://api.github.com')
					// should fire once for each PR with conflicts which is 2 for this test
					.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$rebase'])
					.reply(200)

				const addRebase2 = nock('https://api.github.com')
					// should fire once for each PR with conflicts which is 2 for this test
					.post('/repos/Kyle-Mendes/public-repo/issues/2/labels', ['$$rebase'])
					.reply(200)

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
					request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(slack.isDone()).to.be.true
						expect(conflictWarning.isDone()).to.be.true
						expect(conflictWarning2.isDone()).to.be.true
						expect(reviews.isDone()).to.be.true
						expect(addRebase.isDone()).to.be.true
						expect(addRebase2.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(allPulls.isDone()).to.be.true
						expect(pull1.isDone()).to.be.true
						expect(pull2.isDone()).to.be.true
						// should have 1 pending mock for slack message NOT sent
						expect(nock.pendingMocks()).to.be.empty
						done()
					}, 50)
				})
			})

			it('Handles Merge into Master', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestMergedMaster
				const sha = payload.pull_request.head.sha

				const slack = nock(slackUrl)
					.post('')
					.reply(200)

				const issue = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/issues/1')
					.reply(200, githubPayloads.issue.issue)

				const firebaseLog = nock('https://webhooks-front.firebaseio.com')
					.filteringPath(function(path) {
						return '';
					})
					.put('').times(2)
					.reply(200)

				const ticketResponse = nock('https://reelio.atlassian.net')
					.get('/rest/api/2/issue/XYZ-2')
					.reply(200, jiraPayloads.ticket.genericTicketData)

				const ticketResponse2 = nock('https://reelio.atlassian.net')
					.get('/rest/api/2/issue/XYZ-3')
					.reply(200, jiraPayloads.ticket.genericTicketData)

				const reviews = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1/reviews')
					.reply(200,
						[
							{ state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108742 },
							{ state: 'approved', user: { id: 25992031 }, submitted_at: 1489426108738 },
						],
					)

				const allPulls = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls')
					.reply(200, githubPayloads.pullRequest.singlePull)

				const pull = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1')
					.reply(200, githubPayloads.pullRequest.pullRequestMergeable)

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
					request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(slack.isDone()).to.be.true
						expect(ticketResponse.isDone()).to.be.true
						expect(ticketResponse2.isDone()).to.be.true
						expect(reviews.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(allPulls.isDone()).to.be.true
						expect(pull.isDone()).to.be.true
						expect(nock.pendingMocks()).to.be.empty
						done()
					}, 50)
				})
			})

		})
	})
}

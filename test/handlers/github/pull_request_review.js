// tests for github
// Generated by serverless-mocha-plugin
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

export function PullRequestReview() {
	describe('Check PR Review Status', () => {
		beforeEach(() => {
			nock.cleanAll()
		})

		it('Only triggers review process for specific actions (i.e. not "Closed")', (done) => {
			let payload = payloads.pullRequest.pullRequestBadAction
				setTimeout(() => {
					expect(CheckReviews(payload, 'pull_request')).to.equal('Invalid Action')
					done()
				}, 10)
			})

		it('Skips Review Process and returns CI success if PR is into master', (done) => {
			const payload = payloads.pullRequest.pullRequestOpenedMaster
			const sha = payload.pull_request.head.sha
			const successCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					{
						state: 'success',
						description: 'No reviews required',
						context: 'ci/reelio',
					})
				.reply(200)

			CheckReviews(payload, 'pull_request')
				setTimeout(() => {
					expect(CheckReviews(payload, 'pull_request', 1)).to.equal('Master Branch')
					expect(successCI.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 10)
			})

		it('Returns CI failure if fewer than 2 reviews', (done) => {
			const payload = payloads.pullRequest.pullRequestOpenedStaging
			const sha = payload.pull_request.head.sha

			const failureCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					{
						state: 'failure',
						description: `This PR requires 1 more approved review to be merged.`,
						context: 'ci/reelio',
					})
				.reply(200)

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/pulls/1/reviews')
				.reply(200,
					 [
						 { state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108738 },
					 ],
				 )

			const add = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$review'])
				.reply(200)
			const removeQA = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24qa')
				.reply(200)
			const removeApproved = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/approved')
				.reply(200)

			CheckReviews(payload, 'pull_request')
				setTimeout(() => {
					expect(failureCI.isDone()).to.be.true
					expect(add.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(removeApproved.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 10)
			})

		it('Returns CI failure if not all reviews are approved', (done) => {
			const payload = payloads.pullRequest.pullRequestOpenedStaging
			const sha = payload.pull_request.head.sha

			const failureCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					{
						state: 'failure',
						description: 'This PR is blocked from merging due to a pending request for changes.',
						context: 'ci/reelio',
					})
				.reply(200)

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/pulls/1/reviews')
				.reply(200,
					 [
						 { state: 'changes_requested', user: { id: 15472986 }, submitted_at: 1489426108756 },
						 { state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108742 },
						 { state: 'approved', user: { id: 25992031 }, submitted_at: 1489426108738 },
					 ],
				 )

			const add = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$review'])
				.reply(200)
			const removeQA = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24qa')
				.reply(200)
			const removeApproved = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/approved')
				.reply(200)

			CheckReviews(payload, 'pull_request')
				setTimeout(() => {
					expect(failureCI.isDone()).to.be.true
					expect(add.isDone()).to.be.true
					expect(removeQA.isDone()).to.be.true
					expect(removeApproved.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 50)
			})

		it('Returns CI success if 2 reviews, all approved', (done) => {
			const payload = payloads.pullRequest.pullRequestOpenedStaging
			const sha = payload.pull_request.head.sha

			const successCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					{
						state: 'success',
						description: `At least 2 reviews, all reviews approved.`,
						context: 'ci/reelio',
					})
				.reply(200)

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/pulls/1/reviews')
				.reply(200,
					 [
						 { state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108742 },
						 { state: 'approved', user: { id: 25992031 }, submitted_at: 1489426108738 },
					 ],
				 )

			const add = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ["approved","$$qa"])
				.reply(200)

			const removeReview = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24review')
				.reply(200)

			const removeChanges = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/changes%20requested')
				.reply(200)

			CheckReviews(payload, 'pull_request')
				setTimeout(() => {
					expect(successCI.isDone()).to.be.true
					expect(add.isDone()).to.be.true
					expect(removeReview.isDone()).to.be.true
					expect(removeChanges.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 20)
			})

		it('Returns CI success if 2+ reviews, all approved', (done) => {
			const payload = payloads.pullRequest.pullRequestOpenedStaging
			const sha = payload.pull_request.head.sha

			const successCI = nock('https://api.github.com')
				.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
					{
						state: 'success',
						description: `At least 2 reviews, all reviews approved.`,
						context: 'ci/reelio',
					})
				.reply(200)

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/pulls/1/reviews')
				.reply(200,
					 [
						 { state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108742 },
						 { state: 'approved', user: { id: 25992031 }, submitted_at: 1489426108738 },
						 { state: 'approved', user: { id: 6400039 }, submitted_at: 1489426108755 },
					 ],
				 )

			const add = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ["approved","$$qa"])
				.reply(200)

			const removeChanges = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/changes%20requested')
				.reply(200)

			const removeReview = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24review')
				.reply(200)

			CheckReviews(payload, 'pull_request')
				setTimeout(() => {
					expect(successCI.isDone()).to.be.true
					expect(add.isDone()).to.be.true
					expect(removeReview.isDone()).to.be.true
					expect(removeChanges.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 20)
			})

			it('Handles 1 approved review', (done) => {
				const request = Object.assign({}, { headers: headers.github }, { body: payloads.review.approved })
				request.headers['X-Github-Event'] = payloads.review.event

				const sha = 'b7a1f9c27caa4e03c14a88feb56e2d4f7500aa63'

				const addReview = nock('https://api.github.com')
					.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$review'])
					.reply(200)

				const removeQA = nock('https://api.github.com')
					.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24qa')
					.reply(200)

				const removeApproved = nock('https://api.github.com')
					.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/approved')
					.reply(200)

				const successCI = nock('https://api.github.com')
					.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`)
					.reply(200)

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(response).to.not.be.empty
						expect(response.body).to.equal('Github -- Review Changes Success')
						expect(addReview.isDone()).to.be.true
						expect(successCI.isDone()).to.be.true
						expect(nock.pendingMocks()).to.be.empty
						done()
					}, 50)
				})
			})

			it('Handles 2nd approved review', (done) => {
				const request = Object.assign({}, { headers: headers.github }, { body: payloads.review.approved })
				request.headers['X-Github-Event'] = payloads.review.event

				const sha = 'b7a1f9c27caa4e03c14a88feb56e2d4f7500aa63'

				const reviews = nock('https://api.github.com')
					.get('/repos/Kyle-Mendes/public-repo/pulls/1/reviews')
					.reply(200,
						 [
							 { state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108742 },
							 { state: 'approved', user: { id: 25992031 }, submitted_at: 1489426108738 },
						 ],
					 )

				const add = nock('https://api.github.com')
					.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['approved', '$$qa'])
					.reply(200)

				const remove = nock('https://api.github.com')
					.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/changes%20requested')
					.reply(200)

				const removeReview = nock('https://api.github.com')
					.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24review')
					.reply(200)

				const successCI = nock('https://api.github.com')
					.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`)
					.reply(200)

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(response).to.not.be.empty
						expect(response.body).to.equal('Github -- Review Changes Success')
						expect(add.isDone()).to.be.true
						expect(removeReview.isDone()).to.be.true
						expect(remove.isDone()).to.be.true
						expect(successCI.isDone()).to.be.true
						expect(nock.pendingMocks()).to.be.empty
						done()
					}, 50)
				})
			})

			it('handles declined reviews', (done) => {
				const request = Object.assign({}, { headers: headers.github }, { body: payloads.review.denied })
				request.headers['X-Github-Event'] = payloads.review.event

				const sha = 'b7a1f9c27caa4e03c14a88feb56e2d4f7500aa63'

				const add = nock('https://api.github.com')
					.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['changes requested'])
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

				const failureCI = nock('https://api.github.com')
					.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
						{
							state: 'failure',
							description: `This PR requires 2 more approved reviews to be merged.`,
							context: 'ci/reelio',
						})
					.reply(200)

				const slack = nock(slackUrl)
					.post('')
					.reply(200)

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(response).to.not.be.empty
						expect(response.body).to.equal('Github -- Review Changes Request')
						expect(add.isDone()).to.be.true
						expect(addReview.isDone()).to.be.true
						expect(removeQA.isDone()).to.be.true
						expect(removeApproved.isDone()).to.be.true
						expect(slack.isDone()).to.be.true
						expect(failureCI.isDone()).to.be.true
						expect(nock.pendingMocks()).to.be.empty
						done()
					}, 50)
				})
			})

	})
}
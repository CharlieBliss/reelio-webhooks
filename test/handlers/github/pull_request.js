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

		// it.only('Should warn author if PR is "ticketless"', (done) => {
		// 	let payload = payloads.pullRequest.pullRequestOpenedStaging
		// 		setTimeout(() => {
		// 			expect(CheckReviews(payload, 'pull_request')).to.equal('Invalid Action')
		// 			done()
		// 		}, 10)
		// 	})

		})

	}

const mochaPlugin = require('serverless-mocha-plugin')
const mod = require('../../../src/handlers/github')
const nock = require('nock')

const lambdaWrapper = mochaPlugin.lambdaWrapper
const expect = mochaPlugin.chai.expect
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' })

const headers = require('../../payloads/headers')
const payloads = require('../../payloads/github')
const slackUrl = require('../../../src/consts').SLACK_URL

export function Status() {
	describe('Handles Status Changes', () => {
		beforeEach(() => {
			nock.cleanAll()
		})

		it('Handles Status Change (failure)', (done) => {
			const request = Object.assign({},
				{ headers: headers.github },
				{ body: payloads.status.failure })
			request.headers['X-Github-Event'] = 'status'

			const slack = nock(slackUrl)
				.post('')
				.reply(200)

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(slack.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 10)
			})
		})

		it('Handles Status Change (success)', (done) => {
			const request = Object.assign({},
				{ headers: headers.github },
				{ body: payloads.status.success })
			request.headers['X-Github-Event'] = 'status'

			const slack = nock(slackUrl)
				.post('')
				.reply(200)

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(slack.isDone()).to.not.be.true
					expect(nock.pendingMocks()).to.not.be.empty
					done()
				}, 10)
			})
		})

	})
}

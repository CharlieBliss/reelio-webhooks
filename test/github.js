// tests for github
// Generated by serverless-mocha-plugin
const mod = require('../src/handlers/github')
const mochaPlugin = require('serverless-mocha-plugin')
const nock = require('nock')

const lambdaWrapper = mochaPlugin.lambdaWrapper
const expect = mochaPlugin.chai.expect
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' })

const headers = require('./payloads/headers')
const payloads = require('./payloads/github')
const slackUrl = require('../src/consts/slack').SLACK_URL

describe('github', () => {
	describe('pull_request_review', () => {
		beforeEach(() => {
			nock.cleanAll()
		})

		it('Returns 400 for no github event', (done) => {
			const request = Object.assign({}, { headers: headers.github }, { body: payloads.review.approved })
			request.headers['X-Github-Event'] = null

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(response).to.not.be.empty
					expect(response.body).to.equal('Github -- Not a valid github event.')
					expect(response.statusCode).to.equal(400)
					done()
				}, 10)
			})
		})

		it('Returns 400 for no github action', (done) => {
			const request = Object.assign({}, { headers: headers.github }, { body: payloads.review.noAction })
			request.headers['X-Github-Event'] = 'pull_request_review_comment'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(response).to.not.be.empty
					expect(response.statusCode).to.equal(400)
					done()
				}, 10)
			})
		})

		it('Takes no action with unhandled events', (done) => {
			const request = Object.assign({}, { headers: headers.github }, { body: payloads.review.approved })
			request.headers['X-Github-Event'] = "Labeled"

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(response).to.not.be.empty
					expect(response.body).to.equal('Github -- No actions taken.')
					expect(response.statusCode).to.equal(200)
					done()
				}, 10)
			})
		})

		it('handles approved reviews', (done) => {
			const request = Object.assign({}, { headers: headers.github }, { body: payloads.review.approved })
			request.headers['X-Github-Event'] = payloads.review.event

			const remove = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/changes%20requested')
				.reply(200)

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(response).to.not.be.empty
					expect(response.body).to.equal('Github -- Review Changes Success')
					expect(remove.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 10)
			})
		})

		it('handles declined reviews', (done) => {
			const request = Object.assign({}, { headers: headers.github }, { body: payloads.review.denied })
			request.headers['X-Github-Event'] = payloads.review.event

			const add = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['changes requested'])
				.reply(200)

			const remove = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/ready%20to%20review')
				.reply(200)

			const slack = nock(slackUrl)
				.post('')
				.reply(200)

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(response).to.not.be.empty
					expect(response.body).to.equal('Github -- Review Changes Request')
					expect(add.isDone()).to.be.true
					expect(remove.isDone()).to.be.true
					expect(slack.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty

					done()
				}, 10)
			})
		})

		// it('handles comments between reviews', (done) => {
		// 	const request = Object.assign({}, { headers: headers.github }, { body: payloads.review.denied })
		// 	request.headers['X-Github-Event'] = payloads.review.event
		//
		// 	const add = nock('https://api.github.com')
		// 		.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['changes requested'])
		// 		.reply(200)
		//
		// 	const remove = nock('https://api.github.com')
		// 		.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/ready%20to%20review')
		// 		.reply(200)
		//
		// 	const slack = nock(slackUrl)
		// 		.post('')
		// 		.reply(200)
		//
		// 	wrapped.run(request).then((response) => {
		// 		setTimeout(() => {
		// 			expect(response).to.not.be.empty
		// 			expect(response.body).to.equal('Github -- Review Changes Request')
		// 			expect(add.isDone()).to.be.true
		// 			expect(remove.isDone()).to.be.true
		// 			expect(slack.isDone()).to.be.true
		// 			expect(nock.pendingMocks()).to.be.empty
		//
		// 			done()
		// 		}, 10)
		// 	})
		// })

	})
})

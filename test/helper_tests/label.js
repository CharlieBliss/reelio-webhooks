const mochaPlugin = require('serverless-mocha-plugin')
const nock = require('nock')

const expect = mochaPlugin.chai.expect

const headers = require('../payloads/headers')
const payloads = require('../payloads/github')
const Labels = require('../../src/handlers/github/Labels').default
const slackUrl = require('../../src/consts/slack').SLACK_URL

describe('PR labeling', () => {
	describe('Properly handles Adding Label', () => {
		beforeEach(() => {
			nock.cleanAll()
		})

		it('Handles "WIP Added" event', (done) => {
			let payload = payloads.label.addWIP

			const removeReview = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/$$review')
				.reply(200)
			const removeReady = nock('https://api.github.com')
				.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/ready%20to%20review')
				.reply(200)

				Labels(payload)
				setTimeout(() => {
					expect(removeReview.isDone()).to.be.true
					expect(removeReady.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 10)
			})
		})

	describe('Properly handles Removing Labels', () => {
		beforeEach(() => {
			nock.cleanAll()
		})

		it('Handles "WIP removed" label removed', (done) => {
			let payload = payloads.label.removeWIP

			const add = nock('https://api.github.com')
				.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$review', 'ready to review'])
				.reply(200)

				Labels(payload)
				setTimeout(() => {
					expect(add.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 10)
			})

		it('Handles "Changes Requested" label removed', (done) => {
			let payload = payloads.label.removeChanges

			const slack = nock(slackUrl)
				.post('')
				.reply(200)

			const reviews = nock('https://api.github.com')
				.get('/repos/Kyle-Mendes/public-repo/pulls/2/reviews')
				.reply(200,
					 [
						 { state: 'changes_requested', user: { id: 7416637 }, submitted_at: 1489426108742 },
					 ],
				 )

				Labels(payload)
				setTimeout(() => {
					expect(reviews.isDone()).to.be.true
					expect(slack.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 10)
			})

		})

})

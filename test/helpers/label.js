const mochaPlugin = require('serverless-mocha-plugin')
const nock = require('nock')
const expect = mochaPlugin.chai.expect

const headers = require('../payloads/headers')
const payloads = require('../payloads/github')
const nocks = require('../nocks')
const Labels = require('../../src/handlers/github/Labels').default

describe('Properly handles Adding Label', () => {
	beforeEach(() => {
		nock.cleanAll()
	})

	it('Handles "WIP Added" event', (done) => {
		const removeReview = nocks.labels.removeReview()

		let payload = payloads.label.addWIP
		Labels(payload)
		setTimeout(() => {
			expect(removeReview.isDone()).to.be.true
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
		const addReview = nocks.labels.addReview()

		let payload = payloads.label.removeWIP
		Labels(payload)
		setTimeout(() => {
			expect(addReview.isDone()).to.be.true
			expect(nock.pendingMocks()).to.be.empty
			done()
		}, 10)
	})

	it('Handles "Changes Requested" label removed', (done) => {
		const reviews = nocks.reviews.singleChangesRequested()
		const slack = nocks.slack.genericSlack()
		const addReview = nocks.labels.addReview()

		let payload = payloads.label.removeChanges
		Labels(payload)
		setTimeout(() => {
			expect(addReview.isDone()).to.be.true
			expect(slack.isDone()).to.be.true
			expect(reviews.isDone()).to.be.true
			expect(nock.pendingMocks()).to.be.empty
			done()
		}, 10)
	})

})

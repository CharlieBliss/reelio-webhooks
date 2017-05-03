const mochaPlugin = require('serverless-mocha-plugin')
const nock = require('nock')
const expect = mochaPlugin.chai.expect
const payloads = require('../payloads/github')

import Firebase from '../../src/helpers/firebase'

describe('Properly Logs events to Firebase', () => {
	beforeEach(() => {
		nock.cleanAll()
	})

	it('Logs Event with Action', (done) => {
		let service = 'test'
		let project = 'webhook-test'
		let event = 'pull_request'
		let action = 'opened'
		let payload = {}

		const firebaseLog = nock('https://webhooks-front.firebaseio.com')
			.filteringPath(function(path) {
				 return '/test/webhook-test/pull_request/opened/';
			 })
			.put(`/test/webhook-test/pull_request/opened/`)
			.reply(200)

		Firebase.log(service, project, event, action, payload, 10)

		setTimeout(() => {
			expect(Firebase.log(service, project, event, action, payload, 10)).to.equal(`Logged ${event}`)
			expect(firebaseLog.isDone()).to.be.true
			done()
		}, 20)
	})

	it('Logs Event with no Action', (done) => {
		let service = 'test'
		let project = 'webhook-test'
		let event = 'pull_request'
		let payload = {}

		const firebaseLog = nock('https://webhooks-front.firebaseio.com')
			.filteringPath(function(path) {
				 return '/test/webhook-test/pull_request/';
			 })
			.put(`/test/webhook-test/pull_request/`)
			.reply(200)

		Firebase.log(service, project, event, payload, 10)

		setTimeout(() => {
			expect(Firebase.log(service, project, event, payload, 10)).to.equal(`Logged ${event}`)
			expect(firebaseLog.isDone()).to.be.true
			done()
		}, 20)
	})

})

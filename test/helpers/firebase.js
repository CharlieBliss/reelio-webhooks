const mochaPlugin = require('serverless-mocha-plugin')
const expect = mochaPlugin.chai.expect
const nock = require('nock')

const payloads = require('../payloads/github')
const nocks = require('../nocks')

import Firebase from '../../src/helpers/firebase'

describe('Properly Logs events to Firebase', () => {
	beforeEach(() => {
		nock.cleanAll()
		nock.disableNetConnect()
	})

	it('Logs Event with Action', (done) => {
		let service = 'test'
		let project = 'webhook-test'
		let event = 'pull_request'
		let action = 'opened'
		let payload = {}

		const firebaseLog = nocks.firebase.firebasePRWithAction()

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

		const firebaseLog = nocks.firebase.firebasePRNoAction()

		Firebase.log(service, project, event, payload, 10)
		setTimeout(() => {
			expect(Firebase.log(service, project, event, payload, 10)).to.equal(`Logged ${event}`)
			expect(firebaseLog.isDone()).to.be.true
			done()
		}, 30)
	})

})

const mochaPlugin = require('serverless-mocha-plugin')
const nock = require('nock')
const expect = mochaPlugin.chai.expect

const payloads = require('../payloads/github')

import Firebase from '../../src/helpers/firebase'

describe('Properly Logs events to Firebase', () => {
	beforeEach(() => {
		nock.cleanAll()
	})

	it('Logs Event', (done) => {
		const payload = payloads.pullRequest.pullRequestOpenedStaging
		const event = 'pull_request'

		setTimeout(() => {
			expect(Firebase.log('github', payload.repository.full_name, event, 'ticketless', payload)).to.equal(`Logged ${event}`)
			done()
		}, 10)
	})

})

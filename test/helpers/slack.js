const expect = require('chai').expect
const nock = require('nock')

const Slack = require('../../src/helpers/slack').default
const consts = require('../../src/consts/slack')
const nocks = require('../nocks')


describe('helpers -- slack', () => {
	beforeEach(() => {
		nock.cleanAll()
		nock.disableNetConnect()
	})

	it('Should be able to alert when changes are requested', (done) => {
		const slack = nocks.slack.changesRequestedSlack()

		const user = consts.FRONTEND_MEMBERS[7416637]
		const payload = {
			review: {
				html_url: 'http://reelio.com',
			},
		}
		Slack.changesRequested(payload, user)
		setTimeout(() => {
			expect(slack.isDone()).to.be.true
			expect(nock.pendingMocks()).to.be.empty
			done()
		}, 30)
	})

	it('Should be able to alert when a table failed', (done) => {
		const slack = nocks.slack.slackTableFailed()

		Slack.tableFailed('FRONT-1234', { errorMessages: ['That', 'wasn\'t',
		'right.'] })
		setTimeout(() => {
			expect(slack.isDone()).to.be.true
			expect(nock.pendingMocks()).to.be.empty
			done()
		}, 30)
	})

	it('Should be able to alert when firebase failed trimming', (done) => {
		const slack = nocks.slack.slackFirebaseFailed()

		Slack.firebaseFailed('Something went wrong!')

		setTimeout(() => {
			expect(slack.isDone()).to.be.true
			expect(nock.pendingMocks()).to.be.empty
			done()
		}, 30)
	})

})

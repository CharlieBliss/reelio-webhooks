const nock = require('nock')
const mod = require('../src/handlers/jira')
const mochaPlugin = require('serverless-mocha-plugin')

const lambdaWrapper = mochaPlugin.lambdaWrapper;
const expect = mochaPlugin.chai.expect;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'jira' })

describe('jira', () => {
	beforeEach(() => {
		nock.cleanAll()
	})

	it('implement tests here', (done) => {
		expect({name: 'Bob'}).to.not.be.empty;
		done()
	})
})

import * as tests from './jira/index'
const mod = require('../../src/handlers/jira')
const mochaPlugin = require('serverless-mocha-plugin')

const headers = require('../payloads/headers')
const githubPayloads = require('../payloads/github')

const lambdaWrapper = mochaPlugin.lambdaWrapper;
const expect = mochaPlugin.chai.expect;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' })

Object.keys(tests).forEach(test => tests[test]())


describe('JIRA', () => {

	it('Returns 400 for no jira event', (done) => {
		const request = Object.assign({}, { headers: headers.jira }, { body: githubPayloads.review.approved })

		wrapped.run(request).then((response) => {
			setTimeout(() => {
				expect(response).to.not.be.empty
				expect(response.body).to.equal('Jira -- Event not handled')
				expect(response.statusCode).to.equal(200)
				done()
			}, 10)
		})
	})

})

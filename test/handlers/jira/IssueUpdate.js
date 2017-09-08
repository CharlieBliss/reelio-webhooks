const nock = require('nock')
const mod = require('../../../src/handlers/jira')
const mochaPlugin = require('serverless-mocha-plugin')

const headers = require('../../payloads/headers')
const githubPayloads = require('../../payloads/github')
const jiraPayloads = require('../../payloads/jira')
const nocks = require('../../nocks')

const lambdaWrapper = mochaPlugin.lambdaWrapper;
const expect = mochaPlugin.chai.expect;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' })

export function IssueUpdate() {
	describe('IssueUpdate', () => {
		beforeEach(() => {
			nock.cleanAll()
			nock.disableNetConnect()
		})

		it('Handles Issue Update (no action) ', (done) => {
			const request = Object.assign({}, { headers: headers.jira }, { body: JSON.stringify(
				{
					webhookEvent: "jira:issue_updated",
					issue: {
						fields: {
							project: {
								key: 'XYZ',
							},
						},
					},
					changelog: {
						id: "89708",
						items: [
							{
								field: "assignee",
							}
						]
					}
				}
			)})

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(response.body).to.include('Issue Change -- No action taken')
					done()
				}, 50)
			})
		})

		it('Handles Schema Ticket Update (Move to In Progress), no branch', (done) => {
			const staging = nocks.github.getStagingBranch()
			const getSchema = nocks.github.getBlankSchemaBranch()
			const postSchema = nocks.github.createSchemaBranch()
			const slack = nocks.slack.genericSlack()

			const request = Object.assign({}, { headers: headers.jira }, { body: JSON.stringify(jiraPayloads.issueUpdated.schemaToInProgress) })

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(staging.isDone()).to.be.true
					expect(getSchema.isDone()).to.be.true
					expect(postSchema.isDone()).to.be.true
					expect(slack.isDone()).to.be.true
					done()
				}, 50)
			})
		})

		it('Handles Schema Ticket Update (Move to In Progress), existing branch', (done) => {
			const staging = nocks.github.getStagingBranch()
			const getSchema = nocks.github.getSchemaBranch()

			const request = Object.assign({}, { headers: headers.jira }, { body: JSON.stringify(jiraPayloads.issueUpdated.schemaToInProgress) })

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(staging.isDone()).to.be.true
					expect(getSchema.isDone()).to.be.true
					done()
				}, 50)
			})
		})

	})
}

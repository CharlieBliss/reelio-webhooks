const nock = require('nock')
const mod = require('../../../src/handlers/github')
const mochaPlugin = require('serverless-mocha-plugin')

const headers = require('../../payloads/headers')
const githubPayloads = require('../../payloads/github')
const nocks = require('../../nocks')

const lambdaWrapper = mochaPlugin.lambdaWrapper;
const expect = mochaPlugin.chai.expect;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' })

export function Push() {
	describe('Push', () => {
		beforeEach(() => {
			nock.cleanAll()
			nock.disableNetConnect()
		})

		it('Handles Push event with no -schema in branch name', (done) => {
			const firebaseLog = nocks.firebase.genericFirebaseLog()
			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(
					{
						"ref": "terrible/branch/name",
						"repository": {
							"id": 35129377,
							"name": "test/test",
							"full_name": "test/test",
						},
				})
			})
			request.headers['X-Github-Event'] = 'push'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(firebaseLog.isDone()).to.be.true
					expect(response.body).to.include('Github -- Push -- no action taken')
					done()
				}, 50)
			})
		})

		it('Handles Push event with proper branch name, no existing branch', (done) => {
			const firebaseLog = nocks.firebase.genericFirebaseLog()
			const getStaging = nocks.github.getStagingBranch()
			const postSchema = nocks.github.createSchemaBranch()
			const noOpenPulls = nocks.github.noOpenPulls()
			const genericIssuePost = nocks.issues.genericIssuePost()
			const createPullRequest = nocks.pull_request.createPullRequest()
			const updateTable = nocks.jira.updateTable()
			const slack = nocks.slack.genericSlack()

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(githubPayloads.push.genericPush)})
			request.headers['X-Github-Event'] = 'push'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(firebaseLog.isDone()).to.be.true
					expect(getStaging.isDone()).to.be.true
					expect(postSchema.isDone()).to.be.true
					expect(noOpenPulls.isDone()).to.be.true
					expect(genericIssuePost.isDone()).to.be.true
					expect(createPullRequest.isDone()).to.be.true
					expect(updateTable.isDone()).to.be.true
					expect(slack.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 50)
			})
		})

		it('Handles Push event with proper branch name, existing branch', (done) => {
			const firebaseLog = nocks.firebase.genericFirebaseLog()
			const getStaging = nocks.github.getStagingBranch()
			const getFeatureBranch = nocks.github.getFeatureBranch()
			const allOpenPulls = nocks.github.allOpenPulls()
			const genericIssuePost = nocks.issues.genericIssuePost()
			const createPullRequest = nocks.pull_request.createPullRequest()
			const updateTable = nocks.jira.updateTable()
			const slack = nocks.slack.genericSlack()

			const request = Object.assign({},
				{ headers: headers.github },
				{ body: JSON.stringify(githubPayloads.push.genericPush)})
			request.headers['X-Github-Event'] = 'push'

			wrapped.run(request).then((response) => {
				setTimeout(() => {
					expect(firebaseLog.isDone()).to.be.true
					expect(getStaging.isDone()).to.be.true
					expect(getFeatureBranch.isDone()).to.be.true
					expect(allOpenPulls.isDone()).to.be.true
					expect(genericIssuePost.isDone()).to.be.true
					expect(createPullRequest.isDone()).to.be.true
					expect(updateTable.isDone()).to.be.true
					expect(slack.isDone()).to.be.true
					expect(nock.pendingMocks()).to.be.empty
					done()
				}, 50)
			})
		})

	})
}

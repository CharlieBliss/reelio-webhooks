const mochaPlugin = require('serverless-mocha-plugin')
const mod = require('../../../src/handlers/github')
const nock = require('nock')

const lambdaWrapper = mochaPlugin.lambdaWrapper
const expect = mochaPlugin.chai.expect
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handle' })

const headers = require('../../payloads/headers')
const githubPayloads = require('../../payloads/github')
const jiraPayloads = require('../../payloads/jira')
const nocks = require('../../nocks')
const CheckReviews = require('../../../src/handlers/github/CheckReviews').default


export function PullRequest() {
	describe('Handles Pull Requests', () => {
		beforeEach(() => {
			nock.cleanAll()
			nock.disableNetConnect()
		})

		describe('Handles New Pull Request', () => {
			beforeEach(() => {
				nock.cleanAll()
				nock.disableNetConnect()
			})

			it('Handles PR into Master', (done) => {
				const payload = githubPayloads.pullRequest.pullRequestOpenedMaster
				const sha = payload.pull_request.head.sha

				const issue = nocks.issues.genericIssue()
				const ticketStatus = nocks.status.QAgenericSuccess(sha)
				const firebaseLog = nocks.firebase.genericFirebaseLog()


				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
				request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(ticketStatus.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						done()
					}, 50)
				})
			})

			it('Handles PR into Master by devops (does not create new PR)', (done) => {
				const payload = githubPayloads.pullRequest.pullRequestOpenedMasterDevops
				const sha = payload.pull_request.head.sha

				const issue = nocks.issues.masterIssue()
				const successCI = nocks.status.masterSuccessCI(sha)
				const firebaseLog = nocks.firebase.genericFirebaseLog()

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
				request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(successCI.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(response.statusCode).to.equal(200)
						done()
					}, 10)
				})
			})

			it('Should warn author if PR is "ticketless"', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestTicketless
				const sha = payload.pull_request.head.sha

				const issue = nocks.issues.genericIssue()
				const reviews = nocks.reviews.noReviews()
				const failureCI = nocks.status.failureWaitingOnTwoReviews(sha)
				const PRRoute = nocks.pull_request.ticketlessPR()
				const ticketlessComment = nocks.github.ticketlessComment()
				const featureBranchComment = nocks.github.featureBranchComment()
				const addTicketless = nocks.labels.addTicketless()
				const addReview = nocks.labels.addReview()
				const removeQA = nocks.labels.removeQA()
				const removeApproved = nocks.labels.removeApproved()
				const firebaseLog = nocks.firebase.genericFirebaseLog(3)

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
				request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(reviews.isDone()).to.be.true
						expect(failureCI.isDone()).to.be.true
						expect(PRRoute.isDone()).to.be.true
						expect(ticketlessComment.isDone()).to.be.true
						expect(featureBranchComment.isDone()).to.be.true
						expect(addTicketless.isDone()).to.be.true
						expect(addReview.isDone()).to.be.true
						expect(removeQA.isDone()).to.be.true
						expect(removeApproved.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						done()
					}, 50)
				})
			})

			it('Should warn author if PR is "featureless"', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestFeatureless
				const sha = payload.pull_request.head.sha

				const issue = nocks.issues.genericIssue()
				const reviews = nocks.reviews.noReviews()
				const PRRoute = nocks.pull_request.ticketlessPR()
				const failureCI = nocks.status.failureWaitingOnTwoReviews(sha)
				const featurelessComment = nocks.github.featurelessComment()
				const featureBranchComment = nocks.github.featureBranchComment()
				const addFeatureless = nocks.labels.addFeatureless()
				const addReview = nocks.labels.addReview()
				const removeQA = nocks.labels.removeQA()
				const removeApproved = nocks.labels.removeApproved()
				const firebaseLog = nocks.firebase.genericFirebaseLog(2)

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
				request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(reviews.isDone()).to.be.true
						expect(PRRoute.isDone()).to.be.true
						expect(failureCI.isDone()).to.be.true
						expect(featurelessComment.isDone()).to.be.true
						expect(featureBranchComment.isDone()).to.not.be.true
						expect(addFeatureless.isDone()).to.be.true
						expect(addReview.isDone()).to.be.true
						expect(removeQA.isDone()).to.be.true
						expect(removeApproved.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						done()
					}, 50)
				})
			})

			it('Should warn author for both "Ticketless" and "Featureless" ', (done) => {
				let payload = githubPayloads.pullRequest.ticketAndFeatureless
				const sha = payload.pull_request.head.sha

				const issue = nocks.issues.genericIssue()
				const reviews = nocks.reviews.noReviews()
				const PRRoute = nocks.pull_request.ticketlessAndFeaturelessPR()
				const failureCI = nocks.status.failureWaitingOnTwoReviews(sha)
				const ticketlessComment = nocks.github.ticketlessComment()
				const featurelessComment = nocks.github.featurelessComment()
				const featureBranchComment = nocks.github.featureBranchComment()
				const addFeatureless = nocks.labels.addFeatureless()
				const addTicketless = nocks.labels.addTicketless()
				const addReview = nocks.labels.addReview()
				const removeQA = nocks.labels.removeQA()
				const removeApproved = nocks.labels.removeApproved()
				const firebaseLog = nocks.firebase.genericFirebaseLog(3)

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
				request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(reviews.isDone()).to.be.true
						expect(PRRoute.isDone()).to.be.true
						expect(failureCI.isDone()).to.be.true
						expect(ticketlessComment.isDone()).to.be.true
						expect(featurelessComment.isDone()).to.be.true
						expect(featureBranchComment.isDone()).to.not.be.true
						expect(addFeatureless.isDone()).to.be.true
						expect(addTicketless.isDone()).to.be.true
						expect(addReview.isDone()).to.be.true
						expect(removeQA.isDone()).to.be.true
						expect(removeApproved.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						done()
					}, 50)
				})
			})

			it('Should properly handle a new Pull Request (single ticket)', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestOpenedStaging
				const sha = payload.pull_request.head.sha

				const issue = nocks.issues.genericIssue()
				const reviews = nocks.reviews.noReviews()
				const PRRoute = nocks.pull_request.ticketlessPR()
				const ticketStatus = nocks.status.QAgenericSuccess(sha)
				const getTicket = nocks.jira.genericTicketData()
				const featureBranchComment = nocks.github.featureBranchComment()
				const addReview = nocks.labels.addReview()
				const removeQA = nocks.labels.removeQA()
				const removeApproved = nocks.labels.removeApproved()
				const firebaseLog = nocks.firebase.genericFirebaseLog(2)
				const transition = nocks.jira.autoTransition()

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
				request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(reviews.isDone()).to.be.true
						expect(PRRoute.isDone()).to.be.true
						expect(ticketStatus.isDone()).to.be.true
						expect(getTicket.isDone()).to.be.true
						expect(featureBranchComment.isDone()).to.be.true
						expect(addReview.isDone()).to.be.true
						expect(removeQA.isDone()).to.be.true
						expect(removeApproved.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(transition.isDone()).to.be.true
						done()
					}, 50)
				})
			})

			it('Should properly handle a new Pull Request (multi tickets)', (done) => {
				let payload = githubPayloads.pullRequest.stagingMultiTicketsPR
				const sha = payload.pull_request.head.sha

				const issue = nocks.issues.genericIssue()
				const reviews = nocks.reviews.noReviews()
				const PRRoute = nocks.pull_request.stagingMultiTicketsPR()
				const failureCI = nocks.status.failureWaitingOnTwoReviews(sha)
				const firebaseLog = nocks.firebase.genericFirebaseLog(2)
				const ticketStatus = nocks.status.QAWaitingOn2(sha)
				const featureBranchComment = nocks.github.featureBranchComment()
				const addReview = nocks.labels.addReview()
				const removeQA = nocks.labels.removeQA()
				const removeApproved = nocks.labels.removeApproved()
				const ticketResponse = nocks.jira.genericTicketData(2)
				const ticketResponse2 = nocks.jira.xyz3TicketData(2)
				const transition = nocks.jira.autoTransition()
				const transition2 = nocks.jira.autoTransition2()

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
				request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(reviews.isDone()).to.be.true
						expect(PRRoute.isDone()).to.be.true
						expect(failureCI.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(ticketStatus.isDone()).to.be.true
						expect(featureBranchComment.isDone()).to.be.true
						expect(addReview.isDone()).to.be.true
						expect(removeQA.isDone()).to.be.true
						expect(removeApproved.isDone()).to.be.true
						expect(ticketResponse.isDone()).to.be.true
						expect(ticketResponse2.isDone()).to.be.true
						expect(transition.isDone()).to.be.true
						expect(transition2.isDone()).to.be.true
						done()
					}, 50)
				})
			})
		})

		describe('Handles Merge Pull Request', () => {
			beforeEach(() => {
				nock.cleanAll()
				nock.disableNetConnect()
			})

			it('Handles Merge into Staging (with congrats slack to Dev)', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestMergedStaging
				const sha = payload.pull_request.head.sha

				const issue = nocks.issues.genericIssue()
				const slack = nocks.slack.genericSlack()
				const firebaseLog = nocks.firebase.genericFirebaseLog(2)
				const reviews = nocks.reviews.doubleApproved()
				const allPulls = nocks.github.allPullsSingle()
				const pull = nocks.pull_request.mergeablePull()
				const removeRebase = nocks.labels.removeRebase()

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
					request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(slack.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(reviews.isDone()).to.be.true
						expect(allPulls.isDone()).to.be.true
						expect(removeRebase.isDone()).to.be.true
						expect(nock.pendingMocks()).to.be.empty
						done()
					}, 50)
				})
			})

			it('Handles Merge into Staging (no congrats slack to dev)', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestMergedStaging
				const sha = payload.pull_request.head.sha

				const slack = nocks.slack.genericSlack()
				const issue = nocks.issues.genericIssue()
				const firebaseLog = nocks.firebase.genericFirebaseLog()
				const reviews = nocks.reviews.outstandingChanges()
				const allPulls = nocks.github.allPullsSingle()
				const pull = nocks.pull_request.mergeablePull()
				const removeRebase = nocks.labels.removeRebase()

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
					request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(slack.isDone()).to.not.be.true
						expect(reviews.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(allPulls.isDone()).to.be.true
						expect(pull.isDone()).to.be.true
						expect(removeRebase.isDone()).to.be.true
						// should have 1 pending mock for slack message NOT sent
						expect(nock.pendingMocks()).length.to.be(1)
						done()
					}, 50)
				})
			})

			it('Warns of Merge Conflicts upon Merge (single pull with conflicts)', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestMergedStaging
				const sha = payload.pull_request.head.sha

				const issue = nocks.issues.genericIssue()
				const reviews = nocks.reviews.doubleApproved()
				const allPulls = nocks.github.allPullsSingle()
				const pull = nocks.pull_request.conflictingPull()
				const slack = nocks.slack.genericSlack()
				const conflictWarning = nocks.slack.conflictWarningSlack()
				const firebaseLog = nocks.firebase.genericFirebaseLog(2)
				const addRebase = nocks.labels.addRebase()

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
					request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(reviews.isDone()).to.be.true
						expect(allPulls.isDone()).to.be.true
						expect(pull.isDone()).to.be.true
						expect(slack.isDone()).to.be.true
						expect(conflictWarning.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(addRebase.isDone()).to.be.true
						// should have 1 pending mock for slack message NOT sent
						expect(nock.pendingMocks()).to.be.empty
						done()
					}, 50)
				})
			})

			it('Warns of Merge Conflicts upon Merge (multiple pulls with conflicts)', (done) => {
				let payload = githubPayloads.pullRequest.pullRequestMergedStaging
				const sha = payload.pull_request.head.sha

				const issue = nocks.issues.genericIssue()
				const reviews = nocks.reviews.doubleApproved()
				const slack = nocks.slack.genericSlack()
				const conflictWarning = nocks.slack.conflictWarningSlack(1)
				const conflictWarning2 = nocks.slack.conflictWarningSlack(2)
				const firebaseLog = nocks.firebase.genericFirebaseLog(2)
				const allPulls = nocks.github.allPullsMultiple()
				const pull1 = nocks.pull_request.conflictingPull()
				const pull2 = nocks.pull_request.conflictingPull2()
				const addRebase = nocks.labels.addRebase()
				const addRebase2 = nocks.labels.addRebase(2)

				const request = Object.assign({},
					{ headers: headers.github },
					{ body: JSON.stringify(payload) })
					request.headers['X-Github-Event'] = 'pull_request'

				wrapped.run(request).then((response) => {
					setTimeout(() => {
						expect(issue.isDone()).to.be.true
						expect(reviews.isDone()).to.be.true
						expect(slack.isDone()).to.be.true
						expect(conflictWarning.isDone()).to.be.true
						expect(conflictWarning2.isDone()).to.be.true
						expect(firebaseLog.isDone()).to.be.true
						expect(allPulls.isDone()).to.be.true
						expect(pull1.isDone()).to.be.true
						expect(pull2.isDone()).to.be.true
						expect(addRebase.isDone()).to.be.true
						expect(addRebase2.isDone()).to.be.true
						// should have 1 pending mock for slack message NOT sent
						expect(nock.pendingMocks()).to.be.empty
						done()
					}, 50)
				})
			})

			// it('Handles Merge into Master', (done) => {
			// 	let payload = githubPayloads.pullRequest.pullRequestMergedMaster
			// 	const sha = payload.pull_request.head.sha

			// 	const issue = nocks.issues.genericIssue()
			// 	const slack = nocks.slack.genericSlack()
			// 	const firebaseLog = nocks.firebase.genericFirebaseLog(2)
			// 	const ticketResponse = nocks.jira.genericTicketData()
			// 	const ticketResponse2 = nocks.jira.xyz3TicketData()
			// 	const reviews = nocks.reviews.doubleApproved()
			// 	const allPulls = nocks.github.allPullsSingle()
			// 	const pull = nocks.pull_request.mergeablePull()
			// 	const removeRebase = nocks.labels.removeRebase()

			// 	const request = Object.assign({},
			// 		{ headers: headers.github },
			// 		{ body: JSON.stringify(payload) })
			// 		request.headers['X-Github-Event'] = 'pull_request'

			// 	wrapped.run(request).then((response) => {
			// 		setTimeout(() => {
			// 			expect(issue.isDone()).to.be.true
			// 			expect(slack.isDone()).to.be.true
			// 			expect(firebaseLog.isDone()).to.be.true
			// 			expect(ticketResponse.isDone()).to.be.true
			// 			expect(ticketResponse2.isDone()).to.be.true
			// 			expect(reviews.isDone()).to.be.true
			// 			expect(allPulls.isDone()).to.be.true
			// 			expect(pull.isDone()).to.be.true
			// 			expect(removeRebase.isDone()).to.be.true
			// 			expect(nock.pendingMocks()).to.be.empty
			// 			done()
			// 		}, 50)
			// 	})
			// })

		})
	})
}

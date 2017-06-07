import nock from 'nock'

export const genericStatus = (sha) => (
	nock('https://api.github.com')
	.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`)
	.reply(200)
)
// ---------------
// CI-REELIO NOCKS
// ---------------

// ci/reelio failures
export const failureChangedRequested = (sha) => (
	nock('https://api.github.com')
		.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
			{
				state: 'failure',
				description: 'This PR is blocked from merging due to a pending request for changes.',
				context: 'ci/reelio',
			})
		.reply(200)
)

export const failureWaitingOnReview = (sha) => (
	nock('https://api.github.com')
		.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
			{
				state: 'failure',
				description: `This PR requires 1 more approved review to be merged.`,
				context: 'ci/reelio',
			})
		.reply(200)
)

export const failureWaitingOnTwoReviews = (sha) => (
	nock('https://api.github.com')
		.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
			{
				state: 'failure',
				description: `This PR requires 2 more approved reviews to be merged.`,
				context: 'ci/reelio',
			})
		.reply(200)
)

// ci/reelio successes
export const masterSuccessCI = (sha) => (
	nock('https://api.github.com')
		.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
			{
				state: 'success',
				description: 'No reviews required',
				context: 'ci/reelio',
			})
		.reply(200)
)

export const successCI = (sha) => (
	nock('https://api.github.com')
		.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`,
			{
				state: 'success',
				description: `At least 2 reviews, all reviews approved.`,
				context: 'ci/reelio',
			})
		.reply(200)
)

// ---------------
// CI-QA NOCKS
// ---------------

//ci/qa failures
export const QAWaitingOn1 = (sha) => (
	nock('https://api.github.com')
		.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`)
		.reply(200,
			{
				state: 'failure',
				description: `Waiting on 1 ticket to be marked as "done".`,
				context: 'ci/qa-team',
			})
)

export const QAWaitingOn2 = (sha) => (
	nock('https://api.github.com')
		.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`)
		.reply(200,
			{
				state: 'failure',
				description: 'Waiting on two tickets to be marked as "done".',
				context: 'ci/qa-team',
			})
)

//ci/qa successes

export const QAgenericSuccess = (sha) => (
	nock('https://api.github.com')
		.post(`/repos/Kyle-Mendes/public-repo/statuses/${sha}`)
		.reply(200,
			{
				state: 'success',
				description: 'All tickets marked as complete.',
				context: 'ci/qa-team',
			})
)

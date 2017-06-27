import nock from 'nock'


export const singleApproved = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1/reviews')
		.reply(200,
			[
				{ state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108738 },
			],
		)
)

export const doubleApproved = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1/reviews')
		.reply(200,
			[
				{ state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108742 },
				{ state: 'approved', user: { id: 25992031 }, submitted_at: 1489426108738 },
			],
		)
)

export const tripleApproved = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1/reviews')
		.reply(200,
			[
				{ state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108742 },
				{ state: 'approved', user: { id: 25992031 }, submitted_at: 1489426108738 },
				{ state: 'approved', user: { id: 6400039 }, submitted_at: 1489426108755 },
			],
		)
)

export const noReviews = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1/reviews')
		.reply(200,
			[],
		)
)


export const outstandingChanges = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1/reviews')
		.reply(200,
			[
				{ state: 'CHANGES_REQUESTED', user: { id: 15472986 }, submitted_at: 1489426108756 },
				{ state: 'approved', user: { id: 7416637 }, submitted_at: 1489426108742 },
				{ state: 'approved', user: { id: 25992031 }, submitted_at: 1489426108738 },
			],
		)
)

export const singleChangesRequested = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/pulls/1/reviews')
		.reply(200,
			[
				{ state: 'CHANGES_REQUESTED', user: { id: 7416637 }, submitted_at: 1489426108742 },
			],
		)
)

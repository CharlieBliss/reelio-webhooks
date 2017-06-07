import nock from 'nock'

// add labels

export const addChangesRequested = () => (
	nock('https://api.github.com')
		.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['changes requested'])
		.reply(200)
)

export const addFeatureless = () => (
	nock('https://api.github.com')
		.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$featureless'])
		.reply(200)
)

export const addRebase = (pullNumber = 1) => (
	nock('https://api.github.com')
		.post(`/repos/Kyle-Mendes/public-repo/issues/${pullNumber}/labels`, ['$$rebase'])
		.reply(200)
)

export const addReview = () => (
	nock('https://api.github.com')
		.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$review'])
		.reply(200)
)

export const addQA = () => (
	nock('https://api.github.com')
		.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ["$$qa"])
		.reply(200)
)

export const addQAApproved = () => (
	nock('https://api.github.com')
		.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$qa approved'])
		.reply(200)
)

export const addQAandApproved = () => (
	nock('https://api.github.com')
		.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ["approved","$$qa"])
		.reply(200)
)

export const addTicketless = () => (
	nock('https://api.github.com')
		.post('/repos/Kyle-Mendes/public-repo/issues/1/labels', ['$$ticketless'])
		.reply(200)
)

// remove labels

export const removeApproved = () => (
	nock('https://api.github.com')
		.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/approved')
		.reply(200)
)

export const removeChangesRequested = () => (
	nock('https://api.github.com')
		.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/changes%20requested')
		.reply(200)
)

export const removeRebase = () => (
	nock('https://api.github.com')
		.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24rebase')
		.reply(200)
)

export const removeReview = () => (
	nock('https://api.github.com')
		.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24review')
		.reply(200)
)

export const removeQA = () => (
	nock('https://api.github.com')
		.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24qa')
		.reply(200)
)

export const removeQAApproved = () => (
	nock('https://api.github.com')
		.delete('/repos/Kyle-Mendes/public-repo/issues/1/labels/%24%24qa%20approved')
		.reply(200)
)

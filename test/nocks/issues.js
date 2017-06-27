import nock from 'nock'
import * as payloads from '../payloads/github'


export const genericIssue = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/issues/1')
		.reply(200, payloads.issue.genericIssue)
)

export const masterIssue = () => (
	nock('https://api.github.com')
		.get('/repos/test/test/issues/1')
		.reply(200,
			payloads.issue.masterPR
		)
)

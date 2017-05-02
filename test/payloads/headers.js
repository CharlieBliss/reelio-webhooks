import { JIRA_TOKEN } from '../../src/consts'

export const github = {
	'content-type': 'application/json',
	'User-Agent': 'GitHub-Hookshot/9ee66c8',
	'X-GitHub-Event': 'test',
}

export const jira = {
		Accept: 'application/json',
		Authorization: `Basic ${JIRA_TOKEN}`,
}

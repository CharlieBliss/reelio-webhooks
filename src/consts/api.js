export const GITHUB_TOKEN = '8f050e1fdba814881a0a793dd661a5ec6a2d8399'
export const JIRA_TOKEN = 'ZGV2b3BzQHJlZWxpb2xhYnMuY29tOkdhYWVDX0RCZWJwNkV0NGEtd3dkNmZKLTZkbktRWjhw'
export const TICKET_BASE = 'https://reelio.atlassian.net/rest/api/2/issue'
export const jiraRegex = /((XYZ|FRONT|BACK|RA|FAT|DEVOPS)-\d+)/gi
export const jiraRegexWithDescription = /((XYZ|FRONT|BACK|RA|FAT|DEVOPS)-\d+)(.*)/gi
export const deployRegex = /((XYZ|FRONT|BACK|RA|FAT|DEVOPS)-\d+)\s::\s(.+?(?=]))/

export const JiraGithubMap = {
	XYZ: 'Kyle-Mendes/webhook-test',
	ra: 'hangerunderground/reelio',
	front: 'hangerunderground/reelio-front',
	fat: 'hangerunderground/live-tests',
	test: 'test/test',
}

export const githubApiBase = 'https://api.github.com'
export const schemaCustomField = 'customfield_11500'

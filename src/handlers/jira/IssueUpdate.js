import { get } from 'lodash'

import Branches from '../../helpers/branches'
import Slack from '../../helpers/slack'
import { JiraGithubMap } from '../../consts/api'

// When a RA ticket is moved to `in progress` makes a schema branch.
function IssueUpdate(payload) {
	const changelog = get(payload, ['changelog', 'items', '0'], {}) // the issue changelog
	const change = changelog.field // get the issue field that changed.
	const key = payload.issue.fields.project.key

	if (
		change &&
		change === 'status'
	) {

		if (
			changelog.from === '10003' &&
			changelog.to === '3' &&
			(key === 'XYZ' || key === 'test' || key === 'RA')
		) {
			const project = JiraGithubMap[key]
			const ticketNumber = payload.issue.key

			const branch = `schema-${ticketNumber}`

			// Create Schema Branch based off Staging
			Branches.getBranch(project, 'staging').then((data) => {
				const stagingSha = JSON.parse(data).commit.sha

				// Make the schema branch, then make the feature branch.
				Branches.getBranch(project, branch).then(() => (
				// Branch already exists, no need to make it.
				'Branch already exists...'
			), () => {
					Branches.createBranch(project, branch, stagingSha)
					Slack.alertBranch(ticketNumber, get(payload, ['issue', 'fields', 'assignee', 'key']))
				})
			})

			return 'Issue Change -- Schema update'
		}
	}

	return 'Issue Change -- No action taken'
}

export default IssueUpdate

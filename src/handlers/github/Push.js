import Branches from '../../helpers/branches'
import PullRequests from '../../helpers/pullRequests'
import Slack from '../../helpers/slack'
import Tickets from '../../helpers/tickets'

import { schemaCustomField } from '../../consts/api'

/**
 * When a schema branch is updated, creates a feature- branch (if none exits) and creates a schema --> feature PR
 */
function handleSchemaChange(payload, branch) {
	// Create feature-<ticket> and make PR
	const ticket = branch.split('schema-')[1],
		nextBranch = `feature-${ticket}`,
		project = payload.repository.full_name

	// Create Schema Branch based off Staging
	Branches.getBranch(project, 'staging').then((data) => {
		const stagingSha = JSON.parse(data).commit.sha
		const user = payload.sender.id

		// Make the feature branch.
		Branches.getBranch(project, nextBranch).then(() => {
			// Branch already exists, no need to make it.
			PullRequests.createPullRequest(project, branch, nextBranch, `schema for [${ticket}](https://reelio.atlassian.net/browse/${ticket})`, ['WIP']).then((PR) => {
				console.log(PR)
				if (PR) {
					Slack.alertPR(user, branch, nextBranch, PR.html_url)
					Tickets.updateField(ticket, schemaCustomField, PR.html_url)
				}
			})

			return 'Branch already exists...'
		}, () => {
			// Create a PR between the two branches, if one doesn't exist
			Branches.createBranch(project, nextBranch, stagingSha).then(() => {
				PullRequests.createPullRequest(project, branch, nextBranch, `schema for [${ticket}](https://reelio.atlassian.net/browse/${ticket})`, ['WIP']).then((PR) => {
					console.log("DOESN'T EXIST", PR)

					if (PR) {
						Slack.alertPR(user, branch, nextBranch, PR.html_url)
						Tickets.updateField(ticket, schemaCustomField, PR.html_url)
					}
				})

			})
		})
	})
}

function Push(payload) {
	const branch = payload.ref.split('/').pop()
	if (
		branch.includes('schema-') &&
		payload.pusher.name !== 'reelio-devops' &&
		payload.deleted === false
	) {
		return handleSchemaChange(payload, branch)
	}

	return 'Push -- no action taken'
}

export default Push

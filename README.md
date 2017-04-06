# Table of contents:
1. [Status](#status)
1. [Review](#review)
1. [Check Reviewers](#check-reviewers)
1. [Pull Request](#pull-request)
  * [Github](#Github)
  * [Jira](#jira)

## Status:
  **Monitors CircleCI status of Pull Requests**

### On Fail:
  1. Sends slack message to author of PR telling them to review PR on Github/CircleCI
  1. Returns 'CI Status fail' to Github

### On Success:
  1. Sends no Message
  1. Returns 'Review Success' to Github


## Review:
  **Monitors Review status of Pull Requests**

### On Approved:
  1. Runs 'Check Reviewers'

### On Changes Requested:
  1. Adds 'Changed Requested' label to PR
  1. Sends slack message to author of PR telling them to review PR on Github
  1. Runs 'Check Reviewers'

## Check Reviewers
	1. If 2+ Reviews, all approved
		* Adds '$$approved' label to PR
		* Removes '$$review' label from PR
		* Returns ci/reelio Success
		* Transitions JIRA ticket from PR-Submitted to Ready for QA
		* Logs 'Transition' to Firebase
	1. If > 2 Reviews OR not all Reviews approve PR
		* Adds '$$review' label
		* Remove '$$qa' label
		* Remove '$$approved' label
		* Return ci/reelio Failure
	1. If PR is into master branch
		* Skip all above
		* Return ci/reelo Success



## Pull Request
 **Monitors for Pull Requests**

### Github

#### New PR  
  1. Get Github issue
    * If no valid response, return 'NEW PR -- Unhandled but requested'

  1. If there aren't any JIRA ticket references in the body of the PR
		* Warn author in slack
		* Comment on pull request
		* Log 'ticketless' to firebase
		* Add '$$ticketless' label to PR

  1. If branch isn't named starting with 'feature-'
    * Warn author in slack
    * Comment on pull request
    * Log 'featureless' to firebase
    * Add '$$featureless' label to PR

  1. If PR has proper branch name and JIRA reference in body
		* Add S3 link via Github comment
		* Add S3 link to JIRA ticket for QA
		* Log 'reelio-deploy/feature' to firebase
    * Return 'NEW PR -- Complete' to Github

	1. IF PR into master branch
		* Skip all actions above

#### Merge PR
  1. Get Github issue

  1. If PR is targeting master
		* Add all tickets to JIRA
		* Warn QA of pro deploy via Slack
		* Log 'deploy' to firebase

  1. If no changes were made to PR
    * Give kudos to dev (via Slack)
    * Return 'Merged!' to Github

### Labels

	1. Label Added
		1. WIP
			* Remove '$$review' label from PR

	1. Label Removed
		1. WIP
			* Add '$$review' label from PR
		1. Changes Requested
			* Remind all reviewers to re-review PR


#### Always Returns 'Got a pull request!!!'

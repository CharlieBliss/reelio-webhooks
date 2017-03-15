# Table of contents:
1. [Status](#status)
1. [Review](#review)
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

### On Changes Requested:
  1. Adds 'Changed Requested' label to PR
  1. Removes 'Ready To Review' label from PR
  1. Removes 'Approved' label from PR
  1. Sends slack message to author of PR telling them to review PR on Github
  1. Returns 'Review Changes Request' to Github
  1. Returns 'Review Success' to Github

### On Approved:
  1. Adds 'Approved' label to PR
  1. Removes 'Ready To Review' label from PR
  1. Removes 'Changed Requested' label from PR
  1. Returns 'Review Changes Success' to Github
  1. Returns 'Review Success' to Github

## Pull Request
 **Monitors for Pull Requests**

### Github

#### New PR  
  1. Get Github issue
    * If no valid response, return 'NEW PR -- Unhandled but requested'

  1. If there aren't any JIRA ticket references in the body of the PR, warn author (with comment on PR).

  1. If there aren't version labels AND the PR isn't to version branch or dev:
    * Warn author (with comment on PR)
    * Add 'Incomplete' label to PR
    * Send slack message to author
    * Return 'New PR -- Incomplete' to Github

  1. If PR has proper labels and JIRA reference in body
    * Return 'NEW PR -- Complete' to Github

#### Merge PR
  1. Get Github issue
  1. Check for version labels and create New PRs targeting each of those versions
    * Include examples for different cases?

  1. If closed PR is targeting staging branch, alert QA (via Slack) of impending release.
  1. Get reviews from PR

  1. If PR between head and branch already exists:

    * Don't create new PR
    * Add new resolved tickets to body of Existing PR
    * Add resolved tickets to ticket list
    * Update body of old PR.
  1. If PR between head and branch doesn't exist:
    * Create Github issue (Pull Request)
    * If issue fails at any point, tell Kyle

  1. If no changes were made to PR
    * Give kudos to dev (via Slack)
    * Return 'Merged!' to Github

#### Always Returns 'Got a pull request!!!'


### Jira

#### Upon Merge PR
  1. If Base Branch includes 'staging'
    * If PR is going into dev branch and ticket does not already have table
      * Build workflow table for JIRA ticket
      * Warn Kyle if something went wrong building table (via Slack)

  1. If Base Branch includes 'dev'
    * Make sure JIRA ticket is marked "Ready for QA"
    * Update ticket with new table
    * Alert QA Assignee (via comment on JIRA ticket) that ticket was deployed to branch and will soon be ready for testing
    * Update ticket with new table
    * Warn Kyle if something went wrong (via Slack)

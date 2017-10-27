# Constants

### api.js
Different configurations for making api requests.  All tokens in here should be for the Devops account on Jira and Github.

If you add a new jira project, make sure to add a corresponding entry to a github repository in the `JiraGithubMap` object.

### firebase-auth.json
This is the firebase authentication needed for the `firebase-admin` package.  Handles logging all information sent to the webhooks.

**THIS SHOULD NOT BE CHANGED**

### slack.js

A poorly named file that handles gathering and consolodating all employees' tokens.

**Adding a new user**:
 - Get their Slack ID
 - Get their Github ID
 - Get their Slack ID
 - Add all their information to the poorly named `FRONTEND_MEMBERS` object
 - `name` is just what the slack bot shoul call them.

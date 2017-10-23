# Table of contents:
1. [Getting Started](#getting-started)
   a. [Github](#github)
   b. [Jira](#jira)
1. [Deployment](#deployment)

## Getting Started:
1. Install [ngrok](https://ngrok.com/) via `brew`
1. Clone down the repository.
1. Install Dependencies
   - `npm install` or `yarn`
   - `npm install -g serverless`
1. Generate a Github API Token
   - Go to https://github.com/settings/tokens
   - Click Generate New Token
   - Check `repo` and `admin:repo_hook`
   - Copy the output
1. Start the offline serverless runtime
   - `github_token=<your_github_token> sls offline start`
   - `ngrok http 3000`
   
## Github
1. Set up a test repository on your personal Github.
   - Create repo.
   - Go to Settings > Webhooks
   - Add a webhook.
   - Put the ngrok Forwarding URL, followed by `/github `in Payload URL (`http://123.ngrok.io/github`)
   - Set Content Type to `application/json`
   - Select "Send me *everything*."
   - Select "Active"
   - Click "Add Webhook"
1. Go to `Settings -> Collaborators` and add `reelio-devops`
1. Ask a Reelio Admin to accept the request. The email is sent to `devops@reeliolabs.com`
1. Setup config
   - In `./config.json` add an object with:
     - Your github username
     - Your test repository
     - Config options for the functionality you're going to test

## Jira
1. **Add webhook: Do first**
   - In Jira go to Settings -> System -> Advanced -> Webhooks
   - Create a new webhook, copying the config for the **[Sample]** webhook.
1. **testing ticket -> done** 
   - Have an admin go to Workflows -> XYZ -> [Edit Workflow](https://reelio.atlassian.net/plugins/servlet/project-config/XYZ/workflows) -> Diagram
   - Select "Post Functions" on the ["approve" transition](https://reelio.atlassian.net/secure/admin/workflows/ViewWorkflowTransition.jspa?workflowMode=draft&workflowName=XYZ+workflow+with+vetting&workflowTransition=51&descriptorTab=postfunctions&workflowStep=5).
   - Select "add a post function"
   - Select "trigger a webhook"
   - Select your dev webhook.
   
## Deployment
Deployment is done automatically in the `circle.yml` file.  

All a deployment needs is a valid AWS config, with credentials that have the access to the following:

1. Lambda
1. API Gateway
1. S3
1. Cloudwatch

Then, deployments are triggerd using the `sls deploy` command with additional optional environmental targets.

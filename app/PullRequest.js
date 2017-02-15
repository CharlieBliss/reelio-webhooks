import { versionRegex, jiraRegex, SLACK_URL, FRONTEND_MEMBERS } from './consts'
import { constructGet, constructPost } from './utils'

const request = require('request')

function createPullRequest(head, base, payload, labels = []) {

	// Check if there is a PR between the head and branch already.  If there is, we don't need to make a new PR
	request(constructGet(`${payload.repository.url}/pulls?head=${head}&base=${base}&state=open`), (response, errors, openPRs) => {
		const open = JSON.parse(openPRs)
		if (open.length) {
			// sometimes it returns non-results.
			const realOpen = open.filter(o => o.head.ref === head || o.base.ref === base)
			if (realOpen) {
				console.log('SKIPPING PR', open.map(o => ({ head: o.head.ref, base: o.base.ref })))
				return
			}
		}

		// create Issue.  To add lables to the PR on creation, it needs to start as an issue
		const issue = {
			title: `${head} --> ${base} -- ${payload.pull_request.title}`,
			body: `# Merging from branch ${head} into ${base}.\n\n${payload.pull_request.body}\n\nPrevious PR: ${payload.pull_request.html_url}`,
			labels: ['$$webhook', ...labels],
		}

		request(constructPost(`${payload.repository.url}/issues`, issue), (err, res, body) => {
			let resBody = JSON.parse(body)

			// If making the issue fails, tell Kyle
			if (body.errors) {
				request(constructPost(SLACK_URL, {
					channel: '@kyle',
					username: 'PR Bot',
					icon_url: 'https://octodex.github.com/images/yaktocat.png',
					text: `Something went wrong when trying to make new PRs based off of: <${payload.pull_request.html_url}|GitHub>.\n\n\`\`\`${resBody.errors}\`\`\``,
				}))
			} else {
				const pr = {
					issue: JSON.parse(body).number,
					head,
					base,
				}

				console.log('PR', pr)

				request(constructPost(`${payload.repository.url}/pulls`, pr), (e, r, b) => {
					console.log('CREATE PR', JSON.parse(b))
					resBody = JSON.parse(b)

					if (e) {
						request(constructPost(SLACK_URL, {
							channel: '@kyle',
							username: 'PR Bot',
							icon_url: 'https://octodex.github.com/images/yaktocat.png',
							text: `Something went wrong when trying to make new PRs based off of: <${payload.pull_request.html_url}|GitHub>.\n\n\`\`\`${resBody.errors}\`\`\``,
						}))
					}
				})
			}
		})
	})

}

function handleNew(payload, reply) {
	const user = FRONTEND_MEMBERS[payload.pull_request.user.id]

	// Get the issue, not the PR
	request(constructGet(payload.pull_request.issue_url), (err, res, body) => {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			console.log('NEW Labels:', JSON.parse(body).labels)
			const labels = JSON.parse(body).labels || []

			const filteredLabels = labels.filter(label => versionRegex.test(label.name)),
				head = payload.pull_request.head.ref,
				base = payload.pull_request.base.ref,
				prBody = payload.pull_request.body || '',
				tickets = prBody.match(jiraRegex)

			// If there aren't any JIRA tickets in the body as well, warn them
			if (!tickets && !labels.map(l => l.name).includes('$$webhook')) {
				const feedback = `@${payload.pull_request.user.login} - It looks like you didn't include JIRA ticket references in this ticket.  Are you sure you have none to reference?`
				request(constructPost(`${payload.pull_request.issue_url}/comments`, { body: feedback }))
			}

			// If there aren't any version labels, and the PR isn't to a version branch or dev,
			// warn the developer to add labels, and label the PR "Incomplete"
			if (
				!filteredLabels.length &&
				!labels.map(l => l.name).includes('$$webhook') &&
				base !== 'dev' &&
				!head.includes('staging') &&
				!head.includes('master')
			) {

				const feedback = `@${payload.pull_request.user.login} - It looks like you forgot to label this PR with a version tag.  Please update your PR to include targetted version distrubtions.  Thanks!`
				request(constructPost(`${payload.pull_request.issue_url}/comments`, { body: feedback }))
				request(constructPost(`${payload.pull_request.issue_url}/labels`, ['incomplete']))

				if (user) {
					request(constructPost(SLACK_URL, {
						channel: user.slack_id,
						username: 'Label Bot',
						icon_url: 'https://octodex.github.com/images/privateinvestocat.jpg',
						text: `Hey there, ${user.name}.  Your pull request is missing labels!  Please add labels for <${payload.pull_request.html_url}|your PR>.`,
					}))
				}

				return reply('New PR -- Incomplete')
			}

			return reply('New PR -- Complete')
		}

		return reply('New PR -- Unhandled but requested')
	})
}

function handleMerge(payload, reply) {
	let labels = [],
		filteredLabels = [],
		reviews = []

	const user = FRONTEND_MEMBERS[payload.pull_request.user.id],
		head = payload.pull_request.base.ref

	// Get the issue, not the PR
	request(constructGet(payload.pull_request.issue_url), (err, res, body) => {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			labels = JSON.parse(body).labels || []

			filteredLabels = labels.filter(label => versionRegex.test(label.name))
		}

		// If there were version labels, create new PRs targetting those branches
		// Example: PR into 3.0-dev is tagged 3.0 && 3.1 -> PR to 3.1-dev
		//          PR into 3.0-dev is tagged 3.0 -> no action
		if (filteredLabels.length) {
			filteredLabels.forEach((label) => {
				// only make new PR if the label doesn't match the current branch.
				if (!head.includes(label.name)) {

					createPullRequest(head, `${label.name}-dev`, payload, ['only'])
				}
			})
		}

		// If it's a dev branch, continue the PR along the path
		// Example: 3.0-dev is accepted -> new PR into 3.0-staging
		//          dev is accepted -> new PR into staging
		if (head.includes('dev')) {
			let target = head.substr(0, head.indexOf('-')) // get the version number of the current branch
			target = target ? `${target}-staging` : 'staging'

			createPullRequest(head, target, payload)
		}

		// If it's a dev branch and it's not tagged "only", create a PR into dev
		// Example: 3.0-dev is accepted -> new PR into dev
		if (
			versionRegex.test(head) &&
			head.includes('dev') &&
			!labels.map(l => l.name).includes('only')
		) {
			createPullRequest(head, 'dev', payload)
		}


	})

	// Get the reviews
	request(constructGet(`${payload.pull_request.url}/reviews`), (err, res, body) => {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			reviews = JSON.parse(body) || []

			reviews = reviews.map(r => r.state)
		}

		// If the PR was merged without any changes requested, :tada: to the dev!
		if (!reviews.includes('CHANGES_REQUESTED')) {
			request(constructPost(SLACK_URL, {
				channel: user.slack_id,
				username: 'Merge Bot',
				icon_url: 'https://octodex.github.com/images/welcometocat.png',
				text: `:tada::party_parrot::tada:Nice work, ${user.name}!  Your <${payload.pull_request.html_url}|pull request> was merged without needing changes! Keep up the good work! :tada::party_parrot::tada:`,
			}))
		}
	})


	return reply('Merged!')
}

function PullRequest(req, reply) {
	const payload = req.payload

	if (payload.action === 'opened') {
		return handleNew(payload, reply)
	}

	if (payload.action === 'closed' && payload.pull_request.merged_at) {
		return handleMerge(payload, reply)
	}

	return reply('Got a pull request!!!')
}

export default PullRequest

import rp from 'request-promise'
import request from 'request'
import Slack from './slack'

import Github from './github'
import { githubApiBase } from '../consts/api'

class PullRequests {
	checkIfPullRequest(url, head, base) {
		// Check if there is a PR between the head and branch already.  If there is, we don't need to make a new PR
		return rp(Github.get(`${url}/pulls?head=${head}&base=${base}&state=open`)).then((openPRs) => {
			const open = JSON.parse(openPRs)
			if (open.length) {
				// sometimes it returns non-results.
				const realOpen = open.filter(o => o.head.ref === head && o.base.ref === base)
				if (realOpen.length) {
					// return the already open PR
					return realOpen[0]
				}

				return false
			}

			return false
		})
	}

	createNextPullRequest(head, base, payload, newBody = '', labels = []) {
		this.checkIfPullRequest(payload.repository.url, head, base).then((exists) => {

			if (exists && exists.length) {
				console.log('SKIPPING PR', head, base, open.map(o => ({ head: o.head.ref, base: o.base.ref })))

				// append the new resolved tickets to the existing PR
				// Assumes that there will only ever be ONE PR returned here...
				const editedBody = exists.body + newBody.substr(newBody.indexOf('\n'), newBody.length) // append the resolved tickets to the ticket list

				request(Github.patch(exists.url, { body: editedBody })) // update the body of the old PR
				return
			}

			// create Issue.  To add labels to the PR on creation, it needs to start as an issue
			const issue = {
				title: `${head} --> ${base}`,
				body: `## Merging from branch ${head} into ${base}.\n\n### Previous PR: ${payload.pull_request.html_url}\n\n${newBody}`,
				labels: ['$$webhook', ...labels],
			}

			request(Github.post(`${payload.repository.url}/issues`, issue), (err, res, body) => {
				let resBody = JSON.parse(body)

				// If making the issue fails, slack Kyle
				if (body.errors) {
					Slack.prWarning(head, base, payload.repository.url)
				} else {
					const pr = {
						issue: JSON.parse(body).number,
						head,
						base,
					}

					console.log('PR', pr)

					request(Github.post(`${payload.repository.url}/pulls`, pr), (e, r, b) => {
						console.log('CREATE PR', JSON.parse(b))
						resBody = JSON.parse(b)

						if (e || !resBody.number) {
							Slack.prWarning(head, base, payload.repository.url)
						}
					})
				}
			})
		})
	}

	createPullRequest(project, head, base, content, labels = []) {
		return this.checkIfPullRequest(`${githubApiBase}/repos/${project}`, head, base).then((exists) => {

			if (exists) {
				console.log('PR already exists', exists.number)
				return false // There's already a PR so we can just skip.
			}

			// create Issue.  To add labels to the PR on creation, it needs to start as an issue
			const issue = {
				title: `${head} --> ${base}`,
				body: `## Merging from branch ${head} into ${base}.\n${content}`,
				labels: ['$$webhook', ...labels],
			}

			return rp(Github.post(`${githubApiBase}/repos/${project}/issues`, issue)).then((body) => {
				let resBody = JSON.parse(body)

				// If making the issue fails, slack Kyle
				if (body.errors) {
					Slack.prWarning(head, base, body)

					return false
				}

				const pr = {
					issue: JSON.parse(body).number,
					head,
					base,
				}

				return rp(Github.post(`${githubApiBase}/repos/${project}/pulls`, pr)).then((b) => {
					resBody = JSON.parse(b)

					if (!resBody.number) {
						console.log(resBody)
						Slack.prWarning(head, base, body)
						return false
					}

					return resBody // return the PR
				})
			})
		})
	}
}

export default new PullRequests()

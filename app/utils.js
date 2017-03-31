import { GITHUB_TOKEN, JIRA_TOKEN } from './consts'

export function uniqueTicketFilter(value, index, self) {
	return self.indexOf(value) === index
}

export function wrapJiraTicketsFromArray(ticket) {
	return `[${ticket.toUpperCase()}](https://reelio.atlassian.net/browse/${ticket.toUpperCase()})`
}

export function constructGet(url, target = 'github') {
	console.log('GETTING', url)

	if (target === 'github') {
		return {
			url,
			method: 'GET',
			headers: {
				Authorization: `token ${GITHUB_TOKEN}`,
				'User-Agent': 'Kyle-Mendes',
				Accept: 'application/vnd.github.black-cat-preview+json',
			},
		}
	} else if (target === 'jira') {
		return {
			url,
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: `Basic ${JIRA_TOKEN}`,
			},
		}
	}

	return {}
}

export function constructPost(url, payload, target = 'github') {
	console.log('POSTING TO ', url)

	if (target === 'github') {
		return {
			url,
			method: 'POST',
			headers: {
				Authorization: `token ${GITHUB_TOKEN}`,
				'User-Agent': 'Kyle-Mendes',
				'content-type': 'application/json',
			},
			body: JSON.stringify(payload),
		}
	} else if (target === 'jira') {
		return {
			url,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				Authorization: `Basic ${JIRA_TOKEN}`,
				'content-type': 'application/json',
			},
			body: JSON.stringify(payload),
		}
	}

	return {}
}

export function constructPatch(url, payload, target = 'github') {
	console.log('PATCHING TO ', url)
	if (target === 'github') {
		return {
			url,
			method: 'PATCH',
			headers: {
				Authorization: `token ${GITHUB_TOKEN}`,
				'User-Agent': 'Kyle-Mendes',
				'content-type': 'application/json',
			},
			body: JSON.stringify(payload),
		}
	} else if (target === 'jira') {
		return {
			url,
			method: 'PATCH',
			headers: {
				Accept: 'application/json',
				Authorization: `Basic ${JIRA_TOKEN}`,
				'content-type': 'application/json',
			},
			body: JSON.stringify(payload),
		}
	}

	return {}
}

export function constructPut(url, payload, target = 'github') {
	console.log('PUTTING TO ', url)

	if (target === 'github') {
		return {
			url,
			method: 'PUT',
			headers: {
				Authorization: `token ${GITHUB_TOKEN}`,
				'User-Agent': 'Kyle-Mendes',
				'content-type': 'application/json',
			},
			body: JSON.stringify(payload),
		}
	} else if (target === 'jira') {
		return {
			url,
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				Authorization: `Basic ${JIRA_TOKEN}`,
				'content-type': 'application/json',
			},
			body: JSON.stringify(payload),
		}
	}

	return {}
}

export function constructDelete(url) {
	return {
		url,
		method: 'DELETE',
		headers: {
			Authorization: `token ${GITHUB_TOKEN}`,
			'User-Agent': 'Kyle-Mendes',
		},
	}
}

export function parseReviews(reviews) {
	// grab the data we care about
	const parsed = reviews.map(r => ({
		state: r.state,
		user: r.user.id,
		submitted: new Date(r.submitted_at),
	}))

	const data = {}

	// group reviews by review author, and only keep the newest review
	parsed.forEach((p) => {
		// we only care about reviews that are approved or denied.
		if (p.state.toLowerCase() !== 'approved' || p.state.toLowerCase() !== 'changes_requested') {
			return
		}

		// Check if the new item was submitted AFTER
		// the already saved review.  If it was, overwrite
		if (data[p.user]) {
			const submitted = data[p.user].submitted
			data[p.user] = submitted > p.submitted ? data[p.user] : p
		} else {
			data[p.user] = p
		}
	})

	return Object.keys(data).map(k => data[k])
}

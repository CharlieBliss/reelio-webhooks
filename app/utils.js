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

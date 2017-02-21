import { token } from './consts'

export function uniqueTicketFilter(value, index, self) {
	return self.indexOf(value) === index
}

export function wrapJiraTicketsFromArray(ticket) {
	return `[${ticket.toUpperCase()}](https://reelio.atlassian.net/browse/${ticket.toUpperCase()})`
}

export function constructGet(url) {
	console.log('GETTING', url)
	return {
		url,
		method: 'GET',
		headers: {
			Authorization: `token ${token}`,
			'User-Agent': 'Kyle-Mendes',
			Accept: 'application/vnd.github.black-cat-preview+json',
		},
	}
}

export function constructPost(url, payload) {
	console.log('POSTING TO ', url)
	return {
		url,
		method: 'POST',
		headers: {
			Authorization: `token ${token}`,
			'User-Agent': 'Kyle-Mendes',
			'content-type': 'application/json',
		},
		body: JSON.stringify(payload),
	}
}

export function constructPatch(url, payload) {
	console.log('PATCHING TO ', url)
	return {
		url,
		method: 'PATCH',
		headers: {
			Authorization: `token ${token}`,
			'User-Agent': 'Kyle-Mendes',
			'content-type': 'application/json',
		},
		body: JSON.stringify(payload),
	}
}


export function constructDelete(url) {
	return {
		url,
		method: 'DELETE',
		headers: {
			Authorization: `token ${token}`,
			'User-Agent': 'Kyle-Mendes',
		},
	}
}

import { token } from './consts'

export function constructGet(url) {
	console.log('GETTING', url);
	return {
		url,
		method: 'GET',
		headers: {
			Authorization: `token ${token}`,
			'User-Agent': 'Kyle-Mendes',
		},
	}
}

export function constructPost(url, payload) {
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

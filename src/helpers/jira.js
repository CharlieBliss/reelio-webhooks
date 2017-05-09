import { JIRA_TOKEN } from '../consts'

class JiraHelper {
	get headers() {
		return {
			Accept: 'application/json',
			Authorization: `Basic ${JIRA_TOKEN}`,
			'content-type': 'application/json',
		}
	}

	get(url) {
		return {
			url,
			method: 'GET',
			headers: this.headers,
		}
	}

	post(url, payload) {
		return {
			url,
			method: 'POST',
			headers: this.headers,
			body: JSON.stringify(payload),
		}
	}

	patch(url, payload) {
		return {
			url,
			method: 'PATCH',
			headers: this.headers,
			body: JSON.stringify(payload),
		}
	}

	put(url, payload) {
		return {
			url,
			method: 'PUT',
			headers: this.headers,
			body: JSON.stringify(payload),
		}
	}

	delete(url) {
		return {
			url,
			method: 'DELETE',
			headers: this.headers,
		}
	}

	respond(message, statusCode = 200) {
		return {
			statusCode,
			body: `Jira -- ${message}`,
		}
	}
}

export default new JiraHelper()

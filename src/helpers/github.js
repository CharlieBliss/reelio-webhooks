import { GITHUB_TOKEN } from '../consts'

class GithubHelper {
	get headers() {
		return {
			Authorization: `token ${GITHUB_TOKEN}`,
			'User-Agent': 'Kyle-Mendes',
			Accept: 'application/vnd.github.black-cat-preview+json',
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
			body: `Github -- ${message}`,
		}
	}

	parseReviews(reviews) {
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
			if (p.state.toLowerCase() !== 'approved' && p.state.toLowerCase() !== 'changes_requested') {
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
}


export default new GithubHelper()

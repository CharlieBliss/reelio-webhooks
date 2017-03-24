'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.uniqueTicketFilter = uniqueTicketFilter;
exports.wrapJiraTicketsFromArray = wrapJiraTicketsFromArray;
exports.constructGet = constructGet;
exports.constructPost = constructPost;
exports.constructPatch = constructPatch;
exports.constructPut = constructPut;
exports.constructDelete = constructDelete;
exports.parseReviews = parseReviews;

var _consts = require('./consts');

function uniqueTicketFilter(value, index, self) {
	return self.indexOf(value) === index;
}

function wrapJiraTicketsFromArray(ticket) {
	return '[' + ticket.toUpperCase() + '](https://reelio.atlassian.net/browse/' + ticket.toUpperCase() + ')';
}

function constructGet(url) {
	var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'github';

	console.log('GETTING', url);

	if (target === 'github') {
		return {
			url: url,
			method: 'GET',
			headers: {
				Authorization: 'token ' + _consts.GITHUB_TOKEN,
				'User-Agent': 'Kyle-Mendes',
				Accept: 'application/vnd.github.black-cat-preview+json'
			}
		};
	} else if (target === 'jira') {
		return {
			url: url,
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: 'Basic ' + _consts.JIRA_TOKEN
			}
		};
	}

	return {};
}

function constructPost(url, payload) {
	var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'github';

	console.log('POSTING TO ', url);

	if (target === 'github') {
		return {
			url: url,
			method: 'POST',
			headers: {
				Authorization: 'token ' + _consts.GITHUB_TOKEN,
				'User-Agent': 'Kyle-Mendes',
				'content-type': 'application/json'
			},
			body: JSON.stringify(payload)
		};
	} else if (target === 'jira') {
		return {
			url: url,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				Authorization: 'Basic ' + _consts.JIRA_TOKEN,
				'content-type': 'application/json'
			},
			body: JSON.stringify(payload)
		};
	}

	return {};
}

function constructPatch(url, payload) {
	var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'github';

	console.log('PATCHING TO ', url);
	if (target === 'github') {
		return {
			url: url,
			method: 'PATCH',
			headers: {
				Authorization: 'token ' + _consts.GITHUB_TOKEN,
				'User-Agent': 'Kyle-Mendes',
				'content-type': 'application/json'
			},
			body: JSON.stringify(payload)
		};
	} else if (target === 'jira') {
		return {
			url: url,
			method: 'PATCH',
			headers: {
				Accept: 'application/json',
				Authorization: 'Basic ' + _consts.JIRA_TOKEN,
				'content-type': 'application/json'
			},
			body: JSON.stringify(payload)
		};
	}

	return {};
}

function constructPut(url, payload) {
	var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'github';

	console.log('PUTTING TO ', url);

	if (target === 'github') {
		return {
			url: url,
			method: 'PUT',
			headers: {
				Authorization: 'token ' + _consts.GITHUB_TOKEN,
				'User-Agent': 'Kyle-Mendes',
				'content-type': 'application/json'
			},
			body: JSON.stringify(payload)
		};
	} else if (target === 'jira') {
		return {
			url: url,
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				Authorization: 'Basic ' + _consts.JIRA_TOKEN,
				'content-type': 'application/json'
			},
			body: JSON.stringify(payload)
		};
	}

	return {};
}

function constructDelete(url) {
	return {
		url: url,
		method: 'DELETE',
		headers: {
			Authorization: 'token ' + _consts.GITHUB_TOKEN,
			'User-Agent': 'Kyle-Mendes'
		}
	};
}

function parseReviews(reviews) {
	// grab the data we care about
	var parsed = reviews.map(function (r) {
		return {
			state: r.state,
			user: r.user.id,
			submitted: new Date(r.submitted_at)
		};
	});

	var data = {};

	// group reviews by review author, and only keep the newest review
	parsed.forEach(function (p) {
		// Check if the new item was submitted AFTER
		// the already saved review.  If it was, overwrite
		if (data[p.user]) {
			var submitted = data[p.user].submitted;
			data[p.user] = submitted > p.submitted ? data[p.user] : p;
		} else {
			data[p.user] = p;
		}
	});

	return Object.keys(data).map(function (k) {
		return data[k];
	});
}
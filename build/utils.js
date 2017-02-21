'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.uniqueTicketFilter = uniqueTicketFilter;
exports.wrapJiraTicketsFromArray = wrapJiraTicketsFromArray;
exports.constructGet = constructGet;
exports.constructPost = constructPost;
exports.constructPatch = constructPatch;
exports.constructDelete = constructDelete;

var _consts = require('./consts');

function uniqueTicketFilter(value, index, self) {
	return self.indexOf(value) === index;
}

function wrapJiraTicketsFromArray(ticket) {
	return '[' + ticket.toUpperCase() + '](https://reelio.atlassian.net/browse/' + ticket.toUpperCase() + ')';
}

function constructGet(url) {
	console.log('GETTING', url);
	return {
		url: url,
		method: 'GET',
		headers: {
			Authorization: 'token ' + _consts.token,
			'User-Agent': 'Kyle-Mendes',
			Accept: 'application/vnd.github.black-cat-preview+json'
		}
	};
}

function constructPost(url, payload) {
	console.log('POSTING TO ', url);
	return {
		url: url,
		method: 'POST',
		headers: {
			Authorization: 'token ' + _consts.token,
			'User-Agent': 'Kyle-Mendes',
			'content-type': 'application/json'
		},
		body: JSON.stringify(payload)
	};
}

function constructPatch(url, payload) {
	console.log('PATCHING TO ', url);
	return {
		url: url,
		method: 'PATCH',
		headers: {
			Authorization: 'token ' + _consts.token,
			'User-Agent': 'Kyle-Mendes',
			'content-type': 'application/json'
		},
		body: JSON.stringify(payload)
	};
}

function constructDelete(url) {
	return {
		url: url,
		method: 'DELETE',
		headers: {
			Authorization: 'token ' + _consts.token,
			'User-Agent': 'Kyle-Mendes'
		}
	};
}
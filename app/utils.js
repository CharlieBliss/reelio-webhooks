'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.constructGet = constructGet;
exports.constructPost = constructPost;
exports.constructDelete = constructDelete;

var _consts = require('./consts');

function constructGet(url) {
	return {
		url: url,
		method: 'GET',
		headers: {
			'User-Agent': 'Kyle-Mendes'
		}
	};
}

function constructPost(url, payload) {
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
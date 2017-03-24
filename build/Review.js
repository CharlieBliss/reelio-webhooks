'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = require('./utils');

var _consts = require('./consts');

var request = require('request');

function handleRequestedChanges(payload) {
	var user = _consts.FRONTEND_MEMBERS[payload.pull_request.user.id];

	request((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['changes requested']));
	request((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/ready%20to%20review'));

	if (user) {
		request((0, _utils.constructPost)(_consts.SLACK_URL, {
			channel: user.slack_id,
			username: 'PR Bot',
			icon_url: 'https://octodex.github.com/images/luchadortocat.png',
			text: 'Hey there, ' + user.name + '.  Your pull request was flagged for changes.  Please review on <' + payload.review.html_url + '|GitHub>.'
		}));
	}

	return 'Review Changes Request';
}

function handleApproved(payload) {
	request((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/ready%20to%20review'));
	request((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/changes%20requested'));

	return 'Review Changes Success';
}

function Review(req, reply) {
	var payload = req.payload;

	if (payload.review.state === 'changes_requested') {
		return handleRequestedChanges(payload, reply);
	}

	if (payload.review.state === 'approved') {
		return handleApproved(payload, reply);
	}

	return 'Review Success';
}

exports.default = Review;
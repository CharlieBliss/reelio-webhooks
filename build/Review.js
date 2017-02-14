'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = require('./utils.js');

var _consts = require('./consts');

var request = require('request');

function handleRequestedChanges(payload, reply) {
	var user = _consts.FRONTEND_MEMBERS[payload.pull_request.user.id];

	request((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['changes requested']));
	request((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/ready%20to%20review'));
	request((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/approved'));

	if (user) {
		request((0, _utils.constructPost)(_consts.SLACK_URL, {
			channel: user.slack_id,
			username: 'PR Bot',
			icon_url: 'https://octodex.github.com/images/luchadortocat.png',
			text: 'Hey there, ' + user.name + '.  Your pull request was flagged for changes.  Please review on <' + payload.review.html_url + '|GitHub>.'
		}));
	}

	// @TODO add slackbot that slacks a link to the PR to the person who opened the PR

	return reply('Review Changes Request');
}

function handleApproved(payload, reply) {
	request((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['approved']));
	request((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/ready%20to%20review'));
	request((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/changes%20requested'));

	return reply('Review Changes Success');
}

function Review(req, reply) {
	var payload = req.payload;

	if (payload.review.state === 'changes_requested') {
		return handleRequestedChanges(payload, reply);
	}

	if (payload.review.state === 'approved') {
		return handleApproved(payload, reply);
	}

	return reply('Review Success');
}

exports.default = Review;
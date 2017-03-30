'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = require('./utils');

var _consts = require('./consts');

var _Slack = require('./Slack');

var _Slack2 = _interopRequireDefault(_Slack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = require('request');

function handleRequestedChanges(payload) {
	var user = _consts.FRONTEND_MEMBERS[payload.pull_request.user.id];

	request((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['changes requested']));
	request((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/ready%20to%20review'));

	if (user) {
		_Slack2.default.slackChangesRequested(payload, user);
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
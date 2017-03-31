'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _consts = require('./consts');

var _utils = require('./utils');

var _Slack = require('./Slack');

var _Slack2 = _interopRequireDefault(_Slack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = require('request');

function triggerReviewReminder(user, payload) {
	request((0, _utils.constructGet)(payload.pull_request.url + '/reviews'), function (err, res, body) {
		var reviews = void 0;
		if (res.statusCode >= 200 && res.statusCode < 300) {
			reviews = JSON.parse(body) || [];
		}

		// get reviewers and send a reminder message for each of them to re-review
		var reviewers = (0, _utils.parseReviews)(reviews);
		reviewers.map(function (reviewer) {
			_Slack2.default.slackReviewReminder(payload, user, reviewer);
			return 'Reviewer Reminded';
		});
	});
}

function handleAddLabel(payload) {
	if (payload.label.name === 'WIP') {
		request((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/$$review'));
		request((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/ready%20to%20review'));
	}
}

function handleUnlabel(payload) {
	var user = _consts.FRONTEND_MEMBERS[payload.pull_request.user.id];

	if (payload.label.name === 'changes requested') {
		triggerReviewReminder(user, payload);
	}

	if (payload.label.name === 'WIP') {
		request((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['$$review', 'ready to review']));
	}
}

function Labels(payload) {
	if (payload.action === 'labeled') {
		return handleAddLabel(payload);
	}

	if (payload.action === 'unlabeled') {
		return handleUnlabel(payload);
	}

	return 'Got a label change';
}

exports.default = Labels;
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = require('./utils');

var _consts = require('./consts');

var request = require('request');

// This component can't easily link to PRs because statuses are for specific commits, not PRs

function handleError(payload, reply) {
	var user = _consts.FRONTEND_MEMBERS[payload.commit.author.id];
	if (user) {
		request((0, _utils.constructPost)(_consts.SLACK_URL, {
			channel: user.slack_id,
			username: 'Circle Bot',
			icon_url: 'https://octodex.github.com/images/socialite.jpg',
			text: 'Hey there, ' + user.name + '.  Your commit did not pass Circle CI\'s test suite.  Please review on <https://github.com/hangarunderground/reelio-front/pulls|GitHub>.'
		}));
	}

	return reply('CI Status fail');
}

function Status(req, reply) {
	var payload = req.payload;

	if (payload.state === 'failure' && payload.context === 'ci/circleci') {
		return handleError(payload, reply);
	}

	return reply('Status Success');
}

exports.default = Status;
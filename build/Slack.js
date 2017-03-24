'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _utils = require('./utils');

var _consts = require('./consts');

var request = require('request');

// @TODO message QA assigned for deploy

function slackErrorWarning(payload, body) {
	request((0, _utils.constructPost)(_consts.SLACK_URL, {
		channel: 'U28LB0AAH',
		username: 'PR Bot',
		icon_url: 'https://octodex.github.com/images/yaktocat.png',
		text: 'Something went wrong when trying to make new PRs based off of: <' + payload.pull_request.html_url + '|GitHub>.\n\n```' + body.errors + '```'
	}));
}

function slackDeployWarning(payload, tickets) {
	var versionText = '<http://pro.reelio.com|production>';

	request((0, _utils.constructPost)(_consts.SLACK_URL, {
		channel: '#frontend-deploys',
		username: 'Deploy Bot',
		icon_url: 'https://octodex.github.com/images/welcometocat.png',
		text: '*A deploy to ' + versionText + '.*  The changes will be ready in ~15 minutes.\n\nThe deploy is based off of <' + payload.pull_request.html_url + '|PR ' + payload.pull_request.number + '>.\n\n*`-- Fixes --`*',
		attachments: [{
			text: tickets,
			color: '#36a64f'
		}, {
			text: versionText,
			color: '#de2656'
		}]
	}));
}

function slackCongrats(payload, user) {
	request((0, _utils.constructPost)(_consts.SLACK_URL, {
		channel: user.slack_id,
		username: 'Merge Bot',
		icon_url: 'https://octodex.github.com/images/welcometocat.png',
		text: ':tada::party_parrot::tada:Nice work, ' + user.name + '!  Your <' + payload.pull_request.html_url + '|pull request> was merged without needing changes! Keep up the good work! :tada::party_parrot::tada:'
	}));
}

function slackReviewReminder(payload, user, reviewer) {
	if (reviewer.state === 'CHANGES_REQUESTED') {
		request((0, _utils.constructPost)(_consts.SLACK_URL, {
			channel: _consts.FRONTEND_MEMBERS[reviewer.user].slack_id,
			username: 'Review Bot',
			icon_url: 'https://octodex.github.com/images/steroidtocat.png',
			text: 'Hi there, ' + _consts.FRONTEND_MEMBERS[reviewer.user].name + '. ' + user.name + '\'s <' + payload.pull_request.html_url + '|Pull Request> has been updated. Please re-review the PR for approval.'
		}));
	}
}

function Slack(type, payload, user, tickets, body, reviewer) {
	switch (type) {
		case 'error':
			slackErrorWarning(payload, body);
			break;
		case 'deploy':
			slackDeployWarning(payload, tickets);
			break;
		case 'congrats':
			slackCongrats(payload, user);
			break;
		case 'review reminder':
			slackReviewReminder(payload, user, reviewer);
			break;

		default:
			console.log('Unknown message type provided');
			break;
	}
	return 'Sent a Slack Message';
}

exports.default = Slack;
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _consts = require('./consts');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('request');

// @TODO message QA assigned for deploy

var Slack = function () {
	function Slack() {
		_classCallCheck(this, Slack);
	}

	_createClass(Slack, [{
		key: 'slackErrorWarning',
		value: function slackErrorWarning(payload, body) {
			request((0, _utils.constructPost)(_consts.SLACK_URL, {
				channel: 'U28LB0AAH',
				username: 'PR Bot',
				icon_url: 'https://octodex.github.com/images/yaktocat.png',
				text: 'Something went wrong when trying to make new PRs based off of: <' + payload.pull_request.html_url + '|GitHub>.\n\n```' + body.errors + '```'
			}));
		}
	}, {
		key: 'slackDeployWarning',
		value: function slackDeployWarning(payload, tickets) {
			var versionText = '<http://pro.reelio.com|production>';

			request((0, _utils.constructPost)(_consts.SLACK_URL, {
				channel: '#frontend-deploys',
				username: 'Deploy Bot',
				icon_url: 'https://octodex.github.com/images/welcometocat.png',
				text: '*A deploy has been made to ' + versionText + '.*  The changes will be ready in ~15 minutes.\n\nThe deploy is based off of <' + payload.pull_request.html_url + '|PR ' + payload.pull_request.number + '>.\n\n*`-- Fixes --`*',
				attachments: [{
					text: tickets,
					color: '#36a64f'
				}, {
					text: versionText,
					color: '#de2656'
				}]
			}));
		}
	}, {
		key: 'slackCongrats',
		value: function slackCongrats(payload, user) {
			request((0, _utils.constructPost)(_consts.SLACK_URL, {
				channel: user.slack_id,
				username: 'Merge Bot',
				icon_url: 'https://octodex.github.com/images/welcometocat.png',
				text: ':tada::party_parrot::tada:Nice work, ' + user.name + '!  Your <' + payload.pull_request.html_url + '|pull request> was merged without needing changes! Keep up the good work! :tada::party_parrot::tada:'
			}));
		}
	}, {
		key: 'slackReviewReminder',
		value: function slackReviewReminder(payload, user, reviewer) {
			if (reviewer.state === 'CHANGES_REQUESTED') {
				request((0, _utils.constructPost)(_consts.SLACK_URL, {
					channel: _consts.FRONTEND_MEMBERS[reviewer.user].slack_id,
					username: 'Review Bot',
					icon_url: 'https://octodex.github.com/images/steroidtocat.png',
					text: 'Hi there, ' + _consts.FRONTEND_MEMBERS[reviewer.user].name + '. ' + user.name + '\'s <' + payload.pull_request.html_url + '|Pull Request> has been updated. Please re-review the PR for approval.'
				}));
			}
		}
	}, {
		key: 'slackChangesRequested',
		value: function slackChangesRequested(payload, user) {
			request((0, _utils.constructPost)(_consts.SLACK_URL, {
				channel: user.slack_id,
				username: 'PR Bot',
				icon_url: 'https://octodex.github.com/images/luchadortocat.png',
				text: 'Hey there, ' + user.name + '.  Your pull request was flagged for changes.  Please review on <' + payload.review.html_url + '|GitHub>.'
			}));
		}
	}, {
		key: 'slackCircleFailure',
		value: function slackCircleFailure(user, commit) {
			request((0, _utils.constructPost)(_consts.SLACK_URL, {
				channel: user.slack_id,
				username: 'Circle Bot',
				icon_url: 'https://octodex.github.com/images/socialite.jpg',
				text: 'Hey there, ' + user.name + '.  Your commit did not pass Circle CI\'s test suite.  Please review on <' + commit + '|GitHub>.'
			}));
		}
	}]);

	return Slack;
}();

exports.default = new Slack();
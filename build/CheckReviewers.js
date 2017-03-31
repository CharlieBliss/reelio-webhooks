'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _Jira = require('./Jira');

var _Jira2 = _interopRequireDefault(_Jira);

var _consts = require('./consts');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CheckReviewers(req, event) {
	var payload = req.payload,
	    action = payload.action,
	    base = payload.pull_request.base.ref,
	    author = payload.pull_request.user;

	var actions = ['opened', 'edited', 'reopened', 'synchronize'];

	// We don't want to run this check on things like PR closed
	if (event === 'pull_request' && !actions.includes(action)) {
		return;
	}

	var prUrl = payload.pull_request.url,
	    sha = payload.pull_request.head.sha;

	// Skip PRs that don't need reviews.
	if (base.includes('master') || author.id.toString() === '25992031') {
		(0, _request2.default)((0, _utils.constructPost)(payload.repository.url + '/statuses/' + sha, {
			state: 'success',
			description: 'No reviews required',
			context: 'ci/reelio'
		}));

		return 'Master Branch'; // eslint-disable-line
	}

	(0, _request2.default)((0, _utils.constructGet)(prUrl + '/reviews'), function (response, errors, body) {
		var reviews = JSON.parse(body) || [],
		    approved = [];

		// group by author keep latest
		reviews = (0, _utils.parseReviews)(reviews);
		approved = reviews.map(function (r) {
			return r.state;
		}).filter(function (r) {
			return r.toLowerCase() === 'approved';
		});

		if (reviews.length > 1 && approved.length > 1) {
			if (reviews.length === approved.length) {
				(0, _request2.default)((0, _utils.constructPost)(payload.repository.url + '/statuses/' + sha, {
					state: 'success',
					description: 'At least 2 reviews, all reviews approved.',
					context: 'ci/reelio'
				}));
				(0, _request2.default)((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['approved', '$$qa']));
				(0, _request2.default)((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/%24%24review'));

				// Move the tickets to "Ready for QA"
				var tickets = payload.pull_request.body.match(_consts.jiraRegex) || [];
				_Jira2.default.transitionTickets(tickets, payload);
			}

			if (reviews.length !== approved.length) {
				(0, _request2.default)((0, _utils.constructPost)(payload.repository.url + '/statuses/' + sha, {
					state: 'failure',
					description: 'This PR is blocked from merging due to a pending request for changes.',
					context: 'ci/reelio'
				}));
				(0, _request2.default)((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['$$review']));
				(0, _request2.default)((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/approved'));
				(0, _request2.default)((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/%24%24qa'));
			}
		} else {
			(0, _request2.default)((0, _utils.constructPost)(payload.repository.url + '/statuses/' + sha, {
				state: 'failure',
				description: 'This PR requires ' + (approved.length === 1 ? 1 : 2) + ' more approved review' + (approved.length > 1 ? 's' : '') + ' to be merged.',
				context: 'ci/reelio'
			}));
			(0, _request2.default)((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['$$review']));
			(0, _request2.default)((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/%24%24qa'));
			(0, _request2.default)((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/approved'));
		}
	});
}

exports.default = CheckReviewers;
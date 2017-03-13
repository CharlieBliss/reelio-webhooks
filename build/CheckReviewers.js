'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseReviews(reviews) {
	// grab the data we care about
	var parsed = reviews.map(function (r) {
		return {
			state: r.state,
			user: r.user.id,
			submitted: new Date(r.submitted_at)
		};
	});

	var data = {};

	// group reviews by review author, and only keep the newest review
	parsed.forEach(function (p) {
		// Check if the new item was submitted AFTER
		// the already saved review.  If it was, overwrite
		if (data[p.user]) {
			var submitted = data[p.user].submitted;
			data[p.user] = submitted > p.submitted ? data[p.user] : p;
		} else {
			data[p.user] = p;
		}
	});

	return Object.keys(data).map(function (k) {
		return data[k].state;
	});
}

function CheckReviewers(req, event) {
	var payload = req.payload,
	    action = payload.action;

	// We don't want to run this check on things like PR closed
	if (event === 'pull_request' && (action !== 'opened' || action !== 'edited' || action !== 'reopened' || action !== 'synchronize')) {
		return;
	}

	var prUrl = payload.pull_request.url,
	    sha = payload.pull_request.head.sha;

	(0, _request2.default)((0, _utils.constructGet)(prUrl + '/reviews'), function (response, errors, body) {
		var reviews = JSON.parse(body);

		// group by author keep latest
		reviews = parseReviews(reviews);
		var approved = reviews.filter(function (r) {
			return r.toLowerCase() === 'approved';
		});
		console.log('reviews', reviews, approved);

		if (reviews.length > 1 && approved.length > 1) {
			(0, _request2.default)((0, _utils.constructPost)(payload.repository.url + '/statuses/' + sha, {
				state: 'success',
				description: 'At least 2 reviewers.',
				context: 'ci/reelio'
			}));
			(0, _request2.default)((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['approved']));
			(0, _request2.default)((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/%24%24review'));
		} else {
			(0, _request2.default)((0, _utils.constructPost)(payload.repository.url + '/statuses/' + sha, {
				state: 'failure',
				description: 'This PR requires ' + (approved.length === 1 ? 1 : 2) + ' more approved review' + (approved.length > 1 ? 's' : '') + ' to be merged.',
				context: 'ci/reelio'
			}));
			(0, _request2.default)((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['$$review']));
			(0, _request2.default)((0, _utils.constructDelete)(payload.pull_request.issue_url + '/labels/approved'));
		}
	});
}

exports.default = CheckReviewers;
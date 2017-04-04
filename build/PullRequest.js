'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _firebase = require('./firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _consts = require('./consts');

var _utils = require('./utils');

var _Slack = require('./Slack');

var _Slack2 = _interopRequireDefault(_Slack);

var _Labels = require('./Labels');

var _Labels2 = _interopRequireDefault(_Labels);

var _Tickets = require('./Tickets');

var _Tickets2 = _interopRequireDefault(_Tickets);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var request = require('request');

function createPullRequest(head, base, payload) {
	var newBody = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
	var labels = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

	// Check if there is a PR between the head and branch already.  If there is, we don't need to make a new PR
	request((0, _utils.constructGet)(payload.repository.url + '/pulls?head=' + head + '&base=' + base + '&state=open'), function (response, errors, openPRs) {
		var open = JSON.parse(openPRs);
		if (open.length) {
			// sometimes it returns non-results.
			var realOpen = open.filter(function (o) {
				return o.head.ref === head && o.base.ref === base;
			});
			if (realOpen.length) {
				console.log('SKIPPING PR', head, base, open.map(function (o) {
					return { head: o.head.ref, base: o.base.ref };
				}));

				// append the new resolved tickets to the existing PR
				// Assumes that there will only ever be ONE PR returned here...
				var editedBody = realOpen[0].body + newBody.substr(newBody.indexOf('\n'), newBody.length); // append the resolved tickets to the ticket list

				request((0, _utils.constructPatch)(realOpen[0].url, { body: editedBody })); // update the body of the old PR
				return;
			}
		}

		// create Issue.  To add lables to the PR on creation, it needs to start as an issue
		var issue = {
			title: head + ' --> ' + base,
			body: '# Merging from branch ' + head + ' into ' + base + '.\n\n### Previous PR: ' + payload.pull_request.html_url + '\n\n' + newBody,
			labels: ['$$webhook'].concat(_toConsumableArray(labels))
		};

		request((0, _utils.constructPost)(payload.repository.url + '/issues', issue), function (err, res, body) {
			var resBody = JSON.parse(body);

			// If making the issue fails, slack Kyle
			if (body.errors) {
				_Slack2.default.slackErrorWarning(payload, body);
			} else {
				var pr = {
					issue: JSON.parse(body).number,
					head: head,
					base: base
				};

				console.log('PR', pr);

				request((0, _utils.constructPost)(payload.repository.url + '/pulls', pr), function (e, r, b) {
					console.log('CREATE PR', JSON.parse(b));
					resBody = JSON.parse(b);

					if (e || !resBody.number) {
						_Slack2.default.slackErrorWarning(payload, body);
					}
				});
			}
		});
	});
}

function handleNew(payload) {
	// Get the issue, not the PR
	request((0, _utils.constructGet)(payload.pull_request.issue_url), function (err, res, body) {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			var _ret = function () {
				console.log('NEW Labels:', JSON.parse(body).labels);

				var labels = JSON.parse(body).labels || [];
				var repo = payload.repository.html_url;
				var head = payload.pull_request.head.ref,
				    prBody = payload.pull_request.body || '',
				    tickets = prBody.match(_consts.jiraRegex);

				if (head === 'staging') {
					return {
						v: 'New Pr -- Don\'t need to handle'
					};
				}

				// If there aren't any JIRA tickets in the body as well, warn them
				if (!tickets && !labels.map(function (l) {
					return l.name;
				}).includes('$$webhook')) {
					var feedback = '@' + payload.pull_request.user.login + ' - It looks like you didn\'t include JIRA ticket references in this ticket.  Are you sure you have none to reference?';
					request((0, _utils.constructPost)(payload.pull_request.issue_url + '/comments', { body: feedback }));
					request((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['$$ticketless']));

					_firebase2.default.log('github', payload.repository.full_name, 'pull_request', 'ticketless', payload);
				}

				// If the branch isn't a feature branch, ask about it
				if (!head.includes('feature-') && !labels.map(function (l) {
					return l.name;
				}).includes('$$webhook')) {
					var _feedback = '@' + payload.pull_request.user.login + ' - It looks like your branch doesn\'t contain `feature-`.  Are you sure this PR shouldn\'t be a feature branch?';
					request((0, _utils.constructPost)(payload.pull_request.issue_url + '/comments', { body: _feedback }));
					request((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['$$featureless']));

					_firebase2.default.log('github', payload.repository.full_name, 'pull_request', 'featureless', payload);
				} else {
					(function () {
						var parsedBranch = head.substr(head.indexOf('-') + 1, head.length),
						    url = 'http://zzz-' + parsedBranch + '.s3-website-us-east-1.amazonaws.com/';

						request((0, _utils.constructPost)(payload.pull_request.issue_url + '/comments', { body: '@' + payload.pull_request.user.login + ' - Thanks for the PR! Your feature branch is now [live](' + url + ')' }));

						var ticketBase = 'https://reelio.atlassian.net/rest/api/2/issue';
						var responses = [];
						var attempts = 0;
						var uniqueTickets = tickets.filter(_utils.uniqueTicketFilter);

						uniqueTickets.map(function (t) {
							return request((0, _utils.constructGet)(ticketBase + '/' + t, 'jira'), function (_, __, data) {
								responses.push(JSON.parse(data));
							});
						});

						_Tickets2.default.getTicketResponses(responses, tickets, attempts, repo, function (formattedTickets) {
							_firebase2.default.log('github', payload.repository.full_name, 'reelio_deploy/feature', null, {
								tickets: formattedTickets,
								fixed_count: tickets.filter(_utils.uniqueTicketFilter).length,
								environment: parsedBranch,
								target: 'url'
							});
						});
					})();
				}

				return {
					v: 'New PR -- Complete'
				};
			}();

			if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
		}

		return 'New PR -- Unhandled but requested';
	});
}

function handleMerge(payload) {
	var labels = [],
	    reviews = [];
	var tickets = payload.pull_request.body.match(_consts.jiraRegex) || [],
	    newBody = '### Resolves:\n' + tickets.filter(_utils.uniqueTicketFilter).map(_utils.wrapJiraTicketsFromArray).join('\n\t');
	var uniqueTickets = tickets.filter(_utils.uniqueTicketFilter);
	var repo = payload.repository.html_url;

	var user = _consts.FRONTEND_MEMBERS[payload.pull_request.user.id],
	    base = payload.pull_request.base.ref; // target of the original PR

	// Get the issue, not the PR
	request((0, _utils.constructGet)(payload.pull_request.issue_url), function (err, res, body) {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			labels = JSON.parse(body).labels || [];
		}

		if (labels.length && base === 'staging') {
			createPullRequest('staging', 'master', payload, newBody, ['$$production']);
		}

		// If the closed PRs target was the master branch, alert QA of impending release
		if (base === 'master') {
			(function () {
				var fixed = tickets.filter(_utils.uniqueTicketFilter),
				    formattedFixed = fixed.map(function (t) {
					return '<https://reelio.atlassian.net/browse/' + t + '|' + t + '>';
				}).join('\n');
				_Slack2.default.slackDeployWarning(payload, formattedFixed);

				var ticketBase = 'https://reelio.atlassian.net/rest/api/2/issue';
				var responses = [];
				var attempts = 0;

				uniqueTickets.map(function (t) {
					return request((0, _utils.constructGet)(ticketBase + '/' + t, 'jira'), function (_, __, data) {
						responses.push(JSON.parse(data));
					});
				});

				_Tickets2.default.getTicketResponses(responses, tickets, attempts, repo, function (formattedTickets) {
					_firebase2.default.log('github', payload.repository.full_name, 'reelio_deploy', null, {
						tickets: formattedTickets,
						fixed_count: tickets.filter(_utils.uniqueTicketFilter).length,
						environment: 'production',
						target: 'pro.reelio.com'
					});
				});
			})();
		}
	});

	// Get the reviews
	request((0, _utils.constructGet)(payload.pull_request.url + '/reviews'), function (err, res, body) {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			reviews = JSON.parse(body) || [];
			reviews = reviews.map(function (r) {
				return r.state;
			});
		}
		// If the PR was merged without any changes requested, :tada: to the dev!
		if (!reviews.includes('CHANGES_REQUESTED') && user.slack_id !== 'U28LB0AAH' && payload.pull_request.user.id.toString() !== '25992031') {
			_Slack2.default.slackCongrats(payload, user);
			_firebase2.default.log('github', payload.repository.full_name, 'pull_request', 'party_parrot', payload);
		}
	});

	return 'Merged!';
}

function PullRequest(req, reply) {
	var payload = req.payload;

	if (payload.action === 'labeled' || payload.action === 'unlabeled') {
		(0, _Labels2.default)(payload);
	}

	if (payload.action === 'opened') {
		return handleNew(payload, reply);
	}

	if (payload.action === 'closed' && payload.pull_request.merged_at) {
		return handleMerge(payload, reply);
	}

	return 'Got a pull request!!!';
}

exports.default = PullRequest;
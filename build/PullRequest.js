'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _consts = require('./consts');

var _utils = require('./utils');

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

			// If making the issue fails, tell Kyle
			if (body.errors) {
				request((0, _utils.constructPost)(_consts.SLACK_URL, {
					channel: '@kyle',
					username: 'PR Bot',
					icon_url: 'https://octodex.github.com/images/yaktocat.png',
					text: 'Something went wrong when trying to make new PRs based off of: <' + payload.pull_request.html_url + '|GitHub>.\n\n```' + resBody.errors + '```'
				}));
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
						request((0, _utils.constructPost)(_consts.SLACK_URL, {
							channel: '@kyle',
							username: 'PR Bot',
							icon_url: 'https://octodex.github.com/images/yaktocat.png',
							text: 'Something went wrong when trying to make new PRs based off of: <' + payload.pull_request.html_url + '|a github PR>.\n\n```' + resBody.errors.message + '```'
						}));
					}
				});
			}
		});
	});
}

function handleNew(payload, reply) {
	var user = _consts.FRONTEND_MEMBERS[payload.pull_request.user.id];

	// Get the issue, not the PR
	request((0, _utils.constructGet)(payload.pull_request.issue_url), function (err, res, body) {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			console.log('NEW Labels:', JSON.parse(body).labels);
			var labels = JSON.parse(body).labels || [];

			var filteredLabels = labels.filter(function (label) {
				return _consts.versionRegex.test(label.name);
			}),
			    head = payload.pull_request.head.ref,
			    base = payload.pull_request.base.ref,
			    prBody = payload.pull_request.body || '',
			    tickets = prBody.match(_consts.jiraRegex);

			// If there aren't any JIRA tickets in the body as well, warn them
			if (!tickets && !labels.map(function (l) {
				return l.name;
			}).includes('$$webhook')) {
				var feedback = '@' + payload.pull_request.user.login + ' - It looks like you didn\'t include JIRA ticket references in this ticket.  Are you sure you have none to reference?';
				request((0, _utils.constructPost)(payload.pull_request.issue_url + '/comments', { body: feedback }));
				request((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['$$ticketless']));
			}

			// If there aren't any version labels, and the PR isn't to a version branch or dev,
			// warn the developer to add labels, and label the PR "Incomplete"
			if (!filteredLabels.length && !labels.map(function (l) {
				return l.name;
			}).includes('$$webhook') && base !== 'dev' && !head.includes('staging') && !head.includes('master')) {

				var _feedback = '@' + payload.pull_request.user.login + ' - It looks like you forgot to label this PR with a version tag.  Please update your PR to include targetted version distrubtions.  Thanks!';
				request((0, _utils.constructPost)(payload.pull_request.issue_url + '/comments', { body: _feedback }));
				request((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['$$incomplete']));

				if (user) {
					request((0, _utils.constructPost)(_consts.SLACK_URL, {
						channel: user.slack_id,
						username: 'Label Bot',
						icon_url: 'https://octodex.github.com/images/privateinvestocat.jpg',
						text: 'Hey there, ' + user.name + '.  Your pull request is missing labels!  Please add labels for <' + payload.pull_request.html_url + '|your PR>.'
					}));
				}

				return reply('New PR -- Incomplete');
			}

			return reply('New PR -- Complete');
		}

		return reply('New PR -- Unhandled but requested');
	});
}

function handleMerge(payload, reply) {
	var labels = [],
	    filteredLabels = [],
	    reviews = [];

	var tickets = payload.pull_request.body.match(_consts.jiraRegex) || [],
	    newBody = '### Resolves:\n' + tickets.filter(_utils.uniqueFilter).map(_utils.wrapJiraTicketsFromArray).join('\n\t');

	var user = _consts.FRONTEND_MEMBERS[payload.pull_request.user.id],
	    base = payload.pull_request.base.ref,
	    // target of the original PR
	head = payload.pull_request.head.ref; // The original PR's head

	// Get the issue, not the PR
	request((0, _utils.constructGet)(payload.pull_request.issue_url), function (err, res, body) {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			labels = JSON.parse(body).labels || [];

			filteredLabels = labels.filter(function (label) {
				return _consts.versionRegex.test(label.name);
			});
		}

		// If there were version labels, create new PRs targetting those branches
		// Example: PR into 3.0-dev is tagged 3.0 && 3.1 -> PR to 3.1-dev
		//          PR into 3.0-dev is tagged 3.0 -> no action
		if (filteredLabels.length) {
			filteredLabels.forEach(function (label) {
				// only make new PR if the label doesn't match the current branch.
				if (!base.includes(label.name)) {

					createPullRequest(head, label.name + '-dev', payload, newBody, ['only']);
				}
			});
		}

		// If the closed PRs target was a dev branch, continue the PR along the path
		// Example: 3.0-dev is accepted -> new PR into 3.0-staging
		//          dev is accepted -> new PR into staging
		if (base.includes('dev')) {
			var target = base.substr(0, base.indexOf('-')); // get the version number of the current branch
			target = target ? target + '-staging' : 'staging';

			createPullRequest(base, target, payload, newBody);
		}

		// If PR target was dev branch and it's not tagged "only", create a PR into dev
		// Example: 3.0-dev is accepted -> new PR into dev
		if (_consts.versionRegex.test(base) && base.includes('dev') && !labels.map(function (l) {
			return l.name;
		}).includes('only')) {
			createPullRequest(head, 'dev', payload, newBody);
		}

		// If the closed PRs target was a staging branch, alert QA of impending release
		// Example: 3.0-staging is accepted -> post in slack all tickets about to be released.
		if (base.includes('staging')) {
			var fixed = tickets.map(function (t) {
				return '<https://reelio.atlassian.net/browse/' + t + '|' + t + '>';
			}).join('\n');

			request((0, _utils.constructPost)(_consts.SLACK_URL, {
				channel: '#frontend-deploys',
				username: 'Deploy Bot',
				icon_url: 'https://octodex.github.com/images/welcometocat.png',
				text: '*A deploy to <http://' + base + '.reelio.com|' + base + '> is pending.*  The changes will be ready in ~15 minutes.\n\nThe deploy is based off of <' + payload.pull_request.html_url + '|PR ' + payload.pull_request.number + '>.\n\n*`-- Fixes --`*',
				attachments: [{
					text: fixed,
					color: '#36a64f'
				}, {
					text: '<' + base + '.reelio.com|' + base + '.reelio.com>',
					color: '#de2656'
				}]
			}));
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
		if (!reviews.includes('CHANGES_REQUESTED') && user.slack_id !== 'U28LB0AAH') {
			request((0, _utils.constructPost)(_consts.SLACK_URL, {
				channel: user.slack_id,
				username: 'Merge Bot',
				icon_url: 'https://octodex.github.com/images/welcometocat.png',
				text: ':tada::party_parrot::tada:Nice work, ' + user.name + '!  Your <' + payload.pull_request.html_url + '|pull request> was merged without needing changes! Keep up the good work! :tada::party_parrot::tada:'
			}));
		}
	});

	return reply('Merged!');
}

function PullRequest(req, reply) {
	var payload = req.payload;

	if (payload.action === 'opened') {
		return handleNew(payload, reply);
	}

	if (payload.action === 'closed' && payload.pull_request.merged_at) {
		return handleMerge(payload, reply);
	}

	return reply('Got a pull request!!!');
}

exports.default = PullRequest;
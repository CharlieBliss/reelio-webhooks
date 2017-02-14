'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _consts = require('./consts');

var _utils = require('./utils');

var request = require('request');

function handleNew(payload, reply) {
	var user = _consts.FRONTEND_MEMBERS[payload.pull_request.user.id];

	// Get the issue, not the PR
	request((0, _utils.constructGet)(payload.pull_request.issue_url), function (err, res, body) {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			console.log('NEW Labels:', JSON.parse(body).labels);
			var labels = JSON.parse(body).labels || [];

			labels = labels.filter(function (label) {
				return _consts.versionRegex.test(label.name);
			});

			var head = payload.pull_request.base.ref;
			// If there aren't any version labels, and the PR isn't to a version branch,
			// warn the developer to add labels, and label the PR "Incomplete"
			if (!labels.length && !_consts.versionRegex.test(head) && head !== 'staging'
			// head !== 'master'
			) {
					var feedback = '@' + payload.pull_request.user.login + ' - It looks like you forgot to label this PR with a version tag.  Please update your PR to include targetted version distrubtions.  Thanks!';
					request((0, _utils.constructPost)(payload.pull_request.issue_url + '/comments', { body: feedback }));
					request((0, _utils.constructPost)(payload.pull_request.issue_url + '/labels', ['incomplete']));

					if (user) {
						request((0, _utils.constructPost)(_consts.SLACK_URL, {
							channel: user.slack_id,
							username: 'Label Bot',
							icon_url: 'https://octodex.github.com/images/privateinvestocat.jpg',
							text: 'Hey there, ' + user.name + '.  Your pull request is missing labels!  Please label at <' + payload.pull_request.html_url + '|GitHub>.'
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
	// Get the issue, not the PR
	request((0, _utils.constructGet)(payload.pull_request.issue_url), function (err, res, body) {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			console.log('CLOSE Labels:', JSON.parse(body).labels);
			var labels = JSON.parse(body).labels || [];

			labels = labels.filter(function (label) {
				return _consts.versionRegex.test(label.name);
			});

			// If there were version labels, create new PRs targetting those branches
			if (labels.length) {
				// 	const head = payload.pull_request.head.ref
				// 	labels.forEach((label) => {
				// 		const pr = {
				// 			title: `${label.name} -- ${payload.pull_request.title}`,
				// 			body: `# Merging from branch ${head} to version ${label.name}\n\n${payload.pull_request.body}`,
				// 			base: label.name,
				// 			head,
				// 		}

				// 		console.log('PR', pr)
				// 		request(constructPost(`${payload.repository.url}/pulls`, pr))
				// 	})
			}

			return reply('Closed and created');
		}

		return reply('Closed');
	});
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
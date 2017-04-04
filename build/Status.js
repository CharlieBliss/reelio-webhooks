'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _lodash = require('lodash');

var _consts = require('./consts');

var _Slack = require('./Slack');

var _Slack2 = _interopRequireDefault(_Slack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This component can't easily link to PRs because statuses are for specific commits, not PRs

function handleError(payload) {
	var user = _consts.FRONTEND_MEMBERS[payload.commit.author.id];
	if (user) {
		_Slack2.default.slackCircleFailure(user);
	}

	return 'CI Status fail';
}

function Status(req, reply, config, org, repo) {
	var payload = req.payload;

	if (payload.state === 'failure' && payload.context === 'ci/circleci' && (0, _lodash.get)(config, [org, repo, 'status', 'enabled'])) {
		return handleError(payload, reply);
	}

	return 'Status Success';
}

exports.default = Status;
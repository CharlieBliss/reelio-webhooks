'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _firebase = require('./firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _consts = require('./consts');

var _utils = require('./utils');

var _Tickets = require('./Tickets');

var _Tickets2 = _interopRequireDefault(_Tickets);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Jira = function () {
	function Jira() {
		_classCallCheck(this, Jira);
	}

	_createClass(Jira, [{
		key: 'transitionTickets',
		value: function transitionTickets(tickets, payload) {
			var head = payload.pull_request.head.ref;
			var parsedBranch = head.substr(head.indexOf('-') + 1, head.length);
			var repo = payload.repository.html_url;

			tickets.forEach(function (ticket) {
				var ticketUrl = 'https://reelio.atlassian.net/rest/api/2/issue/' + ticket,
				    table = '|| Deployed On || PR API || PR Human || Deployed || QA Approved || \n || ' + (0, _moment2.default)().format('l') + ' || [(internal use)|' + payload.pull_request.url + '] || [' + payload.pull_request.number + '|' + payload.pull_request.html_url + '] || [Yes|http://zzz-' + parsedBranch + '.s3-website-us-east-1.amazonaws.com/] || ||';

				// Make sure the ticket is marked as `Ready for QA`
				(0, _request2.default)((0, _utils.constructPost)(ticketUrl + '/transitions', {
					transition: {
						id: 221
					}
				}, 'jira'));

				_Tickets2.default.getTicketFirebaseInfo(ticket, repo, function (board, data) {
					_firebase2.default.log('JIRA', board, 'transition', 'QA', { ticket: data });
				});
				// Update the ticket with our new table
				(0, _request2.default)((0, _utils.constructPut)('' + ticketUrl, {
					fields: {
						customfield_10900: table
					}
				}, 'jira'), function (_, __, resBody) {
					if (!resBody) {
						_Tickets2.default.getTicketFirebaseInfo(ticket, repo, function (board, data) {
							_firebase2.default.log('JIRA', board, 'table', 'updated', { ticket: data });
						});
						return;
					}

					var resp = JSON.parse(resBody);

					if (resp.errorMessages) {
						(0, _request2.default)((0, _utils.constructPost)(_consts.SLACK_URL, {
							channel: 'U28LB0AAH',
							username: 'PR Bot',
							icon_url: 'https://octodex.github.com/images/yaktocat.png',
							text: 'Something went wrong when trying to update the table for: <https://reelio.atlassian.net/browse/' + ticket + '|' + ticket + '>.\n\n```' + resp.errorMessages.join('\n') + '```'
						}));
						console.log('TICKET TABLE FAILED', resp);
					}
				});

				return 'Tickets marked up';
			});
		}
	}, {
		key: 'handleTransition',
		value: function handleTransition(req) {
			console.log('TRANSITION', req.payload.transition.transitionId);
			// GOOD Transition ID = 51
			// if transition.id !== 51, status = declined
			if (req.payload.transition.transitionId === 51) {
				console.log(req.payload.issue);
				var TicketTable = req.payload.issue.fields.customfield_10900;

				if (!TicketTable) {
					// Warn Kyle.  This should be impossible
					(0, _request2.default)((0, _utils.constructPost)(_consts.SLACK_URL, {
						channel: 'U28LB0AAH',
						username: 'PR Bot',
						icon_url: 'https://octodex.github.com/images/yaktocat.png',
						text: 'There was no table for ticket <https://reelio.atlassian.net/browse/' + req.payload.issue.key + '|' + req.payload.issue.key + '>'
					}));
					return 'No table ticket!!!';
				}

				var PRRoute = TicketTable.match(/\[\(internal use\)\|([^\]]*)\]/)[1];
				(0, _request2.default)((0, _utils.constructGet)(PRRoute), function (err, res, resBody) {
					var PR = JSON.parse(resBody),
					    body = PR.body || '',
					    tickets = body.match(_consts.jiraRegex) || [],
					    uniqueTickets = tickets.filter(_utils.uniqueTicketFilter),
					    sha = PR.head.sha;

					// If there's only one ticket, it was just approved so this PR is good
					if (uniqueTickets.length === 1) {
						(0, _request2.default)((0, _utils.constructPost)(PR.head.repo.url + '/statuses/' + sha, {
							state: 'success',
							description: 'All tickets marked as complete.',
							context: 'ci/qa-team'
						}));

						(0, _request2.default)((0, _utils.constructPost)(PR.issue_url + '/labels', ['$$qa approved']));
						(0, _request2.default)((0, _utils.constructDelete)(PR.issue_url + '/labels/%24%24qa'));
					} else {
						(function () {

							// @TODO move this out
							var getTicketResponses = function getTicketResponses() {
								// eslint-disable-line
								if (responses.length < uniqueTickets.length && attempts < 20) {
									setTimeout(function () {
										getTicketResponses();
										attempts += 1;
										console.log('LOOPING', responses.length, attempts);
									}, 1000);
								} else {
									var resolved = responses.filter(function (ticket) {
										return ticket.fields.status.id === '10001';
									});

									if (resolved.length === uniqueTickets.length) {
										(0, _request2.default)((0, _utils.constructPost)(PR.head.repo.url + '/statuses/' + sha, {
											state: 'success',
											description: 'All tickets marked as complete.',
											context: 'ci/qa-team'
										}));

										(0, _request2.default)((0, _utils.constructPost)(PR.issue_url + '/labels', ['$$qa approved']));
										(0, _request2.default)((0, _utils.constructDelete)(PR.issue_url + '/labels/%24%24qa'));
									} else {
										var unresolved = uniqueTickets.length - resolved.length;
										(0, _request2.default)((0, _utils.constructPost)(PR.head.repo.url + '/statuses/' + sha, {
											state: 'failure',
											description: 'Waiting on ' + unresolved + ' ticket' + (unresolved > 1 ? 's' : '') + ' to be marked as "done".',
											context: 'ci/qa-team'
										}));
									}
								}
							};

							var ticketBase = 'https://reelio.atlassian.net/rest/api/2/issue';

							var responses = [];
							var attempts = 0;

							tickets.map(function (t) {
								return (0, _request2.default)((0, _utils.constructGet)(ticketBase + '/' + t, 'jira'), function (_, __, data) {
									responses.push(JSON.parse(data));
								});
							});
							getTicketResponses();
						})();
					}
				});
			}
			return 'PR status updated';
		}
	}]);

	return Jira;
}();

exports.default = new Jira();
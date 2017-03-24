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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import { uniqueTicketFilter, constructGet, constructPut, constructPost } from './utils'
// import Slack from './Slack'

// export function buildJiraWorkflow(tickets, payload) {
// 	const fixed = tickets.filter(uniqueTicketFilter)
// 	fixed.forEach((ticket) => {
// 		const ticketUrl = `https://reelio.atlassian.net/rest/api/2/issue/${ticket}`
// 		const header = '|| ||PR Submitted|| Deployed to Staging|| QA Approved || Deployed On||'

// 		request(constructGet(ticketUrl, 'jira'), (error, response, bdy) => {
// 			if (JSON.parse(bdy).fields.customfield_10900) {
// 				return // the ticket already has a table
// 			}

// 			let table = []

//       // If there aren't any version labels, this is going right into dev.
// 			if (filteredLabels.length) {
// 				table.push(`| *${currentDev}* | No | No | |`)
// 			} else {
// 				table.push(`| *${currentDev}* | No | No | |`)
// 			}

//       // Loop through all labels on the PR and make sure the ticket references all envs
// 			filteredLabels.forEach((l) => {
// 				if (l.name === version) {
// 					table.push(`| *${l.name}* | [Yes|${payload.pull_request.html_url}] | No | |`)
// 				} else {
// 					table.push(`| *${l.name}* | No | No | |`)
// 				}
// 			})

// 			table = table.sort((a, b) => b.match(/\d\.\d/) - a.match(/\d\.\d/)) // sort by version #
// 			table.unshift(header) // add the header in
// 			table = table.join('\n') // concatenate back into a string

// 			console.log('FIXED TICKET', ticket, table)

// 			request(constructPut(`${ticketUrl}`, {
// 				fields: {
// 					customfield_10900: table,
// 				},
// 			}, 'jira'), (_, __, resBody) => {

// 				const resp = JSON.parse(resBody)
// 				if (resp.errorMessages) {
// 					Slack('error', payload, resBody)
// 					firebase.log('JIRA', 'FRONT', 'table', 'failed', resp)

// 					console.log('TICKET TABLE FAILED', resp)
// 				}
// 			})
// 		})
// 	})
// }

// function updateJiraWorkflow(fixed, deployVersion, version, currentDev, payload) {
// 	fixed.forEach((ticket) => {
// 		const ticketUrl = `https://reelio.atlassian.net/rest/api/2/issue/${ticket}`

//     // Make sure the ticket is marked as `Ready for QA`
// 		request(constructPost(`${ticketUrl}/transitions`, {
// 			transition: {
// 				id: 221,
// 			},
// 		}, 'jira'))
// 		firebase.log('JIRA', 'FRONT', 'transition', 'QA', { ticket })

//     // Update the current workflow table with new progress
// 		request(constructGet(ticketUrl, 'jira'), (error, response, bdy) => {
// 			if (error) {
//         // getting ticket failed
// 			}
// 			const ticketInfo = JSON.parse(bdy),
// 				workflowField = ticketInfo.fields.customfield_10900 || '',
// 				qaAssignee = ticketInfo.fields.customfield_10901

// 			if (qaAssignee) {
// 				request(constructPost(`${ticketUrl}/comment`, {
// 					body: `[~${qaAssignee.key}] This ticket was just deployed to [${deployVersion}-staging|http://${deployVersion}-staging.reelio.com] and will be ready to be tested on that environment in about 10 minutes!`,
// 				}, 'jira'))

// 				firebase.log('JIRA', 'FRONT', 'qaAssignee', 'alerted', { assignee: qaAssignee, ticket })
// 			}


// 			const tableRows = workflowField.split('\n') // get the table rows
// 			let newTable = workflowField // copy the old table

// 			if (tableRows.length > 2) {
//         // There are more than 2 rows, so we need to figure out which to update
// 				newTable = tableRows.map((row) => {
//           // If the current table row doesn't include the current branch version, don't edit
// 					if (row.includes(version)) {
// 						return `| *${version}* | [Yes|${payload.pull_request.html_url}] | [Yes|http://${version}-staging.reelio.com] | | ${moment().format('MM/DD/YYYY')}`
// 					} else if (version === 'dev' && row.includes(currentDev)) {
// 						return `| *${currentDev}* | [Yes|${payload.pull_request.html_url}] | [Yes|http://${currentDev}-staging.reelio.com] | | ${moment().format('MM/DD/YYYY')}`
// 					}
// 					return row
// 				})
// 			} else {
// 				tableRows[1] = `| *${deployVersion}* | [Yes|${payload.pull_request.html_url}] | [Yes|http://${deployVersion}-staging.reelio.com] | | ${moment().format('MM/DD/YYYY')}`
// 				newTable = tableRows
// 			}

//       // Update the ticket with our new table
// 			request(constructPut(`${ticketUrl}`, {
// 				fields: {
// 					customfield_10900: newTable.join('\n'),
// 				},
// 			}, 'jira'), (_, __, resBody) => {
// 				if (!resBody) {
// 					firebase.log('JIRA', 'FRONT', 'table', 'updated', { ticket })
// 					return
// 				}

// 				const resp = JSON.parse(resBody)

// 				if (resp.errorMessages) {
// 					request(constructPost(SLACK_URL, {
// 						channel: 'U28LB0AAH',
// 						username: 'PR Bot',
// 						icon_url: 'https://octodex.github.com/images/yaktocat.png',
// 						text: `Something went wrong when trying to update the table for: <https://reelio.atlassian.net/browse/${ticket}|${ticket}>.\n\n\`\`\`${resp.errorMessages.join('\n')}\`\`\``,
// 					}))
// 					console.log('TICKET TABLE FAILED', resp)
// 				}
// 			})
// 		})
// 	})
// }

var Jira = function () {
	function Jira() {
		_classCallCheck(this, Jira);
	}

	_createClass(Jira, [{
		key: 'transitionTickets',
		value: function transitionTickets(tickets, payload) {
			var head = payload.pull_request.head.ref;
			var parsedBranch = head.substr(head.indexOf('-') + 1, head.length);

			tickets.forEach(function (ticket) {
				var ticketUrl = 'https://reelio.atlassian.net/rest/api/2/issue/' + ticket,
				    table = '|| Deployed On || PR API || PR Human || Deployed || QA Approved || \n || ' + (0, _moment2.default)().format('l') + ' || [(internal use)|' + payload.pull_request.url + '] || [' + payload.pull_request.number + '|' + payload.pull_request.html_url + '] || [Yes|http://zzz-' + parsedBranch + '.s3-website-us-east-1.amazonaws.com/] || ||';

				// Make sure the ticket is marked as `Ready for QA`
				(0, _request2.default)((0, _utils.constructPost)(ticketUrl + '/transitions', {
					transition: {
						id: 221
					}
				}, 'jira'));
				_firebase2.default.log('JIRA', 'FRONT', 'transition', 'QA', { ticket: ticket });

				// Update the ticket with our new table
				(0, _request2.default)((0, _utils.constructPut)('' + ticketUrl, {
					fields: {
						customfield_10900: table
					}
				}, 'jira'), function (_, __, resBody) {
					if (!resBody) {
						_firebase2.default.log('JIRA', 'FRONT', 'table', 'updated', { ticket: ticket });
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
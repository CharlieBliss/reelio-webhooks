'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tickets = function () {
	function Tickets() {
		_classCallCheck(this, Tickets);
	}

	_createClass(Tickets, [{
		key: 'getTicketResponses',
		value: function getTicketResponses(responses, tickets, attempts, repo, logData) {
			var _this = this;

			var formattedTickets = void 0;
			if (responses.length < tickets.length && attempts < 20) {
				setTimeout(function () {
					_this.getTicketResponses(responses, tickets, attempts, repo, logData);
					attempts += 1;
					console.log('LOOPING', responses.length, attempts);
				}, 1000);
			} else {
				formattedTickets = responses.map(function (ticket) {
					return {
						name: ticket.key,
						assignee: ticket.fields.assignee.displayName || 'not provided',
						reporter: ticket.fields.reporter.displayName || 'not provided',
						points: ticket.fields.customfield_10004 || 'not provided',
						repository: repo
					};
				});
				return logData(formattedTickets);
			}
			return 'No Tickets';
		}
	}, {
		key: 'getTicketFirebaseInfo',
		value: function getTicketFirebaseInfo(ticket, repo, logData) {
			var ticketBase = 'https://reelio.atlassian.net/rest/api/2/issue';
			var firebaseInfo = void 0;

			(0, _request2.default)((0, _utils.constructGet)(ticketBase + '/' + ticket, 'jira'), function (_, __, data) {
				var ticketInfo = JSON.parse(data);
				var board = ticketInfo.fields.project.key;
				firebaseInfo = {
					name: ticketInfo.key || 'not provided',
					assignee: ticketInfo.fields.assignee.displayName || 'not provided',
					reporter: ticketInfo.fields.reporter.displayName || 'not provided',
					points: ticketInfo.fields.customfield_10004 || 'not provided',
					repository: repo
				};

				return logData(board, firebaseInfo);
			});
		}
	}]);

	return Tickets;
}();

exports.default = new Tickets();
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _firebaseAdmin = require('firebase-admin');

var admin = _interopRequireWildcard(_firebaseAdmin);

var _consts = require('./consts');

var _utils = require('./utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var request = require('request');
var serviceAccount = require('./consts/firebase-auth.json');

var Firebase = function () {
	function Firebase(account) {
		_classCallCheck(this, Firebase);

		this.serviceAccount = account;

		// Initialize the firebase app
		admin.initializeApp({
			credential: admin.credential.cert(this.serviceAccount),
			databaseURL: 'https://webhooks-front.firebaseio.com'
		});

		this.db = admin.database();
	}

	// Logs an action into the right event, project and service
	// For example: Github -> reelio-front -> pull_request -> opened


	_createClass(Firebase, [{
		key: 'log',
		value: function log(service, project, event, action, payload) {
			var _this = this;

			setTimeout(function () {
				if (event === 'create' || event === 'delete') {
					action = payload.ref_type;
				}

				if (event === 'pull_request_review') {
					action = action + ' - ' + payload.review.state;
				}

				// Only log circle failures
				if (event === 'status' && payload.state !== 'failure') {
					return;
				}

				// global
				delete payload.repository;
				delete payload.master_branch;
				delete payload.organization;
				delete payload.pusher_type;
				delete payload.ref_type;
				delete payload.branches;
				delete payload.head_commit;

				try {
					// comments
					if (payload.comment) {
						payload.comment_info = {
							author: payload.comment.user.login,
							issue: {
								url: payload.issue ? payload.issue.url : '',
								title: payload.issue ? payload.issue.title : ''
							}
						};

						delete payload.comment;
					}

					if (payload.pull_request) {
						if (payload.pull_request.head) {
							payload.pull_request.head_info = payload.pull_request.head.ref;
							delete payload.pull_request.head;
						}

						if (payload.pull_request.base) {
							payload.pull_request.base_info = payload.pull_request.base.ref;
							delete payload.pull_request.base;
						}

						delete payload.pull_request._links; // eslint-disable-line
					}

					// pr review
					if (payload.review) {
						payload.reviewer = {
							name: payload.review.user.login,
							id: payload.review.user.id,
							status: payload.review.state,
							body: payload.review.body
						};

						delete payload.review;
					}

					// push
					if (payload.commits) {
						payload.commit_count = payload.commits.length || 0;
						delete payload.commits;
					}

					if (payload.sender) {
						payload.sender_info = {
							id: payload.sender.id,
							author: payload.sender.login
						};

						delete payload.sender;
					}

					// status (CI)
					if (payload.commit) {
						payload.commit_info = {
							url: payload.commit.url,
							author: {
								id: payload.commit.author.id,
								login: payload.commit.author.login
							}
						};
						delete payload.commit;
					}
				} catch (err) {
					request((0, _utils.constructPost)(_consts.SLACK_URL, {
						channel: 'U28LB0AAH',
						username: 'Firebase Bot',
						icon_url: 'https://octodex.github.com/images/yaktocat.png',
						text: 'Something went wrong when trying to trim firebase payload size. Check server logs, scrub'
					}));

					console.warn('FIREBASE NO WORK -- ', err);
				}

				if (action) {
					_this.db.ref(service + '/' + project + '/' + event + '/' + action + '/' + Date.now()).set(payload);
				} else {
					_this.db.ref(service + '/' + project + '/' + event + '/' + Date.now()).set(payload);
				}
			}, 5000);
		}
	}]);

	return Firebase;
}();

exports.default = new Firebase(serviceAccount);
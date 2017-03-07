'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _firebaseAdmin = require('firebase-admin');

var admin = _interopRequireWildcard(_firebaseAdmin);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
			if (event === 'create' || event === 'delete') {
				action = payload.ref_type;
			}

			if (event === 'pull_request_review') {
				action = action + ' - ' + payload.review.state;
			}

			if (action) {
				this.db.ref(service + '/' + project + '/' + event + '/' + action + '/' + Date.now()).set(payload);
			} else {
				this.db.ref(service + '/' + project + '/' + event + '/' + Date.now()).set(payload);
			}
		}
	}]);

	return Firebase;
}();

exports.default = new Firebase(serviceAccount);
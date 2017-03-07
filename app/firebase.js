import * as admin from 'firebase-admin'

const serviceAccount = require('./consts/firebase-auth.json')

class Firebase {
	constructor(account) {
		this.serviceAccount = account

		// Initialize the firebase app
		admin.initializeApp({
			credential: admin.credential.cert(this.serviceAccount),
			databaseURL: 'https://webhooks-front.firebaseio.com',
		})

		this.db = admin.database()
	}

	// Logs an action into the right event, project and service
	// For example: Github -> reelio-front -> pull_request -> opened
	log(service, project, event, action, payload) {
		if (
			event === 'create' ||
			event === 'delete'
		) {
			action = payload.ref_type
		}

		if (event === 'pull_request_review') {
			action = `${action} - ${payload.review.state}`
		}

		if (action) {
			this.db.ref(`${service}/${project}/${event}/${action}/${Date.now()}`).set(payload)
		} else {
			this.db.ref(`${service}/${project}/${event}/${Date.now()}`).set(payload)
		}

	}
}

export default new Firebase(serviceAccount)

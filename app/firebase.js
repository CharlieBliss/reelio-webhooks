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


		// Only log circle failures
		if (event === 'status' && payload.state !== 'failure') {
			return
		}

		// global
		delete payload.repository
		delete payload.master_branch
		delete payload.organization
		delete payload.pusher_type
		delete payload.ref_type
		delete payload.branches

		// comments
		payload.comment_info = {
			author: payload.comment.user.login,
			issue: {
				url: payload.issue.url,
				title: payload.issue.title,
			},
		}
		delete payload.comment
		delete payload.issue

		// pr review
		payload.reviewer_info = {
			name: payload.review.user.login,
			id: payload.review.user.id,
			status: payload.review.user.state,
		}

		delete payload.reviewer

		// push
		payload.commit_count = payload.commits.size
		payload.sender_info = {
			id: payload.sender.id,
			author: payload.sender.login,
		}
		delete payload.commits
		delete payload.head_commit

		// status (CI)
		payload.commit_info = {
			url: payload.commit.url,
			author: {
				id: payload.commit.author.id,
				login: payload.commit.author.login,
			},
		}
		delete payload.commit


		if (action) {
			this.db.ref(`${service}/${project}/${event}/${action}/${Date.now()}`).set(payload)
		} else {
			this.db.ref(`${service}/${project}/${event}/${Date.now()}`).set(payload)
		}

	}
}

export default new Firebase(serviceAccount)

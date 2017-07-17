import request from 'request'
import rp from 'request-promise'
import moment from 'moment'
import { TICKET_BASE, jiraRegex } from '../consts'

import { uniqueTicketFilter } from '../helpers/utils'

import Github from '../helpers/github'
import Firebase from '../helpers/firebase'
import Jira from './jira'
import Slack from '../helpers/slack'


class Tickets {

	formatTicketData(responses = [], repo) {
		return responses.map((ticket) => {
			const assignee = ticket.fields.assignee || null

			return {
				name: ticket.key,
				assignee: assignee ? assignee.displayName : 'not provided',
				reporter: ticket.fields.reporter.displayName || 'not provided',
				points: ticket.fields.customfield_10004 || 'not provided',
				repository: repo,
			}
		})
	}

	transitionTicket(ticketUrl, transitionID) {
		rp(Jira.post(`${ticketUrl}/transitions`, {
			transition: {
				id: transitionID,
			},
		}))
	}

	getJiraStatus(ticket) {
		return rp(Jira.get(`${TICKET_BASE}/${ticket}`))
			.then((response) => {
				const ticketInfo = JSON.parse(response)
				const ticketStatus = ticketInfo.fields.status.id
				return ticketStatus.toString()
			})
	}

	getTicketFirebaseInfo(ticket, repo, logData) {
		let firebaseInfo

		rp(Jira.get(`${TICKET_BASE}/${ticket}`))
			.then((response) => {
				const ticketInfo = (JSON.parse(response))
				const board = ticketInfo.fields.project.key
				const assignee = ticketInfo.fields.assignee || null

				firebaseInfo = {
					name: ticketInfo.key || 'not provided',
					assignee: assignee ? assignee.displayName : 'not provided',
					reporter: ticketInfo.fields.reporter.displayName || 'not provided',
					points: ticketInfo.fields.customfield_10004 || 'not provided',
					repository: repo,
				}
				return logData(board, firebaseInfo)
			})
			.catch(err => err)
	}

	updateTickets(tickets, payload) {
		const head = payload.pull_request.head.ref
		const parsedBranch = head.substr(head.indexOf('-') + 1, head.length).toLowerCase()
		const repo = payload.repository.html_url

		tickets.forEach((ticket) => {
			const ticketUrl = `${TICKET_BASE}/${ticket}`,
				table = `|| Deployed On || PR API || PR Human || Deployed || QA Approved || \n || ${moment().format('l')} || [(internal use)|${payload.pull_request.url}] || [${payload.pull_request.number}|${payload.pull_request.html_url}] || [Yes|http://features.pro.reelio.com/${parsedBranch}] || ||`

			// Make sure the ticket is marked as `Ready for QA`
			this.getJiraStatus(ticket)
				.then((status) => {
					if (status === '10400') {
						this.transitionTicket(ticketUrl, 221)
					}
				})

			this.getTicketFirebaseInfo(ticket, repo, (board, data) => {
				Firebase.log('JIRA', board, 'transition', 'QA', { ticket: data })
			})

			// Update the ticket with our new table
			rp(Jira.put(`${ticketUrl}`, {
				fields: {
					customfield_10900: table,
				},
			}))
				.then((response) => {
					if (!response) {
						this.getTicketFirebaseInfo(ticket, repo, (board, data) => {
							Firebase.log('JIRA', board, 'table', 'updated', { ticket: data })
						})
						return
					}

					const resp = JSON.parse(response)

					if (resp.errorMessages) {
						Slack.tableFailed(ticket, resp)
					}
				})

			return 'Tickets marked up'
		})
	}

	checkTicketStatus(pullRequestRoute, labels = true, status = '10001') {
		rp(Github.get(pullRequestRoute))
			.then((response) => {
				const PR = JSON.parse(response),
					body = PR.body || '',
					tickets = body.match(jiraRegex) || [],
					uniqueTickets = tickets.filter(uniqueTicketFilter),
					sha = PR.head.sha

				if (uniqueTickets.length === 0) {
					return 'No Tickets'
				}

				const responses = []

				Promise.all(uniqueTickets.map(t => rp(Jira.get(`${TICKET_BASE}/${t}`))
						.then((data) => {
							responses.push(JSON.parse(data))
						})
						.catch((err) => { console.log(err) })))
					.then(() => {
						const resolved = responses.filter(ticket => ticket.fields.status.id === status)
						if (resolved.length === uniqueTickets.length) {
							request(Github.post(`${PR.head.repo.url}/statuses/${sha}`, {
								state: 'success',
								description: 'All tickets marked as complete.',
								context: 'ci/qa-team',
							}))
							if (labels) {
								request(Github.post(`${PR.issue_url}/labels`, ['$$qa approved']))
								try {
									request(Github.delete(`${PR.issue_url}/labels/%24%24qa`))
								} catch (e) {
									console.error(`Couldn't remove label $$qa from PR #${PR.id}`)
								}
							}
						} else {
							const unresolved = uniqueTickets.length - resolved.length
							request(Github.post(`${PR.head.repo.url}/statuses/${sha}`, {
								state: 'failure',
								description: `Waiting on ${unresolved} ticket${unresolved > 1 ? 's' : ''} to be marked as "done".`,
								context: 'ci/qa-team',
							}))
							if (labels) {
								request(Github.post(`${PR.issue_url}/labels`, ['$$qa']))
								try {
									request(Github.delete(`${PR.issue_url}/labels/%24%24qa%20approved`))
								} catch (e) {
									console.error(`Couldn't remove label '$$qa approved' from PR #${PR.id}`)
								}
							}
						}
					})

				return 'Ticket Status updated'
			})
			.catch(err => (err))
	}

	setPriority(tickets, pr) {
		let highPriority

		Promise.all(tickets.map(ticket =>
			rp(Jira.get(`${TICKET_BASE}/${ticket}`)),
		))
			.then((response) => {
				highPriority = response.some(ticket => (
					JSON.parse(ticket).fields.priority.id === '1'
				))
			})
			.then(() => {
				if (highPriority) {
					request(Github.post(`${pr}/labels`, ['High Priority']))
				}
			})
	}
}

export default new Tickets()

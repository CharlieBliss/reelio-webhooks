import nock from 'nock'
import * as payloads from '../payloads/jira'



//tickets

export const genericTicketData = (times = 1) => (
	nock('https://reelio.atlassian.net')
		.get('/rest/api/2/issue/XYZ-2').times(times)
		.reply(200, payloads.ticket.genericTicketData)
)

export const resolvedTicket1 = (times = 1) => (
	nock('https://reelio.atlassian.net')
		.get('/rest/api/2/issue/XYZ-2').times(times)
		.reply(200, payloads.ticket.resolvedTicketData)
)

export const resolvedTicket2 = (times = 1) => (
	nock('https://reelio.atlassian.net')
		.get('/rest/api/2/issue/XYZ-3').times(times)
		.reply(200, payloads.ticket.resolvedTicketData)
)
export const unresolvedTicket = (times = 1) => (
	nock('https://reelio.atlassian.net')
		.get('/rest/api/2/issue/XYZ-5').times(times)
		.reply(200, payloads.ticket.genericTicketData)
)

export const xyz3TicketData = (times = 1) => (
	nock('https://reelio.atlassian.net')
		.get('/rest/api/2/issue/XYZ-3').times(times)
		.reply(200, payloads.ticket.genericTicketData)
)

// transitions

export const autoTransition = () => (
	nock('https://reelio.atlassian.net')
		.post('/rest/api/2/issue/XYZ-2/transitions')
		.reply(200)
)

// jira table

export const createTable = () => (
	nock('https://reelio.atlassian.net')
		.put('/rest/api/2/issue/XYZ-2')
		.reply(200)
)

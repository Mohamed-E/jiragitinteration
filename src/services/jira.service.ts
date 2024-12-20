import axios from 'axios';

const JIRA_BASE_URL = 'https://your-jira-instance.atlassian.net';

interface JiraTicket {
	key: string;
	fields: {
		assignee: {
			displayName: string;
		};
		status: {
			name: string;
		};
	};
}

interface JiraServiceInterface {
	validateAuthorAndStatus(ticketNumber: string, author: string, validStatuses: string[]): Promise<boolean>;
}

export class JiraService implements JiraServiceInterface{
	private jiraApiToken: string;
	private jiraUsername: string;

	constructor(jiraApiToken: string, jiraUsername: string) {
		this.jiraApiToken = jiraApiToken;
		this.jiraUsername = jiraUsername;
	}

	private async getJiraTicket(ticketNumber: string): Promise<JiraTicket> {
		const response = await axios.get<JiraTicket>(`${JIRA_BASE_URL}/rest/api/2/issue/${ticketNumber}`, {
			auth: {
				username: this.jiraUsername,
				password: this.jiraApiToken,
			},
		});
		return response.data;
	}

	public async validateAuthorAndStatus(ticketNumber: string, author: string, validStatuses: string[]): Promise<boolean> {
		try {
			const ticket = await this.getJiraTicket(ticketNumber);

			const isAuthorValid = ticket.fields.assignee.displayName === author;
			const isStatusValid = validStatuses.includes(ticket.fields.status.name);

			return isAuthorValid && isStatusValid;
		} catch (error) {
			console.error('Error validating Jira ticket:', error);
			return false;
		}
	}
}

export default JiraService;
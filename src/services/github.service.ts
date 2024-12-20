import { Request, Response } from 'express';
import { get } from 'http';
import { Octokit, App } from 'octokit';
import { JiraService } from './jira.service';

export interface GitHubServiceInterface {
	handleGitHubEvent(req: Request, res: Response): Promise<void>;
}

export class GitHubService implements GitHubServiceInterface {
	private jiraService: JiraService;

	constructor() {
		this.jiraService = new JiraService(process.env.JIRA_API_TOKEN!, process.env.JIRA_USERNAME!);
	}

	public async handleGitHubEvent(req: Request, res: Response): Promise<void> {


		const event = req.headers['x-github-event'];

		if (!event) {
			res.status(400).send('Missing GitHub event header');
			return;
		}

		switch (event) {
			case 'push':
				await this.handlePushEvent(req.body);
				break;
			case 'pull_request':
				await this.handlePullRequestEvent(req.body);
				break;
			default:
				res.status(400).send('Unsupported GitHub event');
				return;
		}

		res.status(200).send('Event processed');
	}

	private async handlePushEvent(payload: any): Promise<void> {
		const commits = payload.commits;
		const ref = payload.ref;
		const repository = payload.repository.full_name;
		const userName = payload.pusher.name;

		// Implement your logic to determine pass/fail status
		let status = 'fail';
		if (commits && userName && commits.length > 0 && ref && repository) {
			// Add additional checks if needed
			for (const commit of commits) {
				const ticketNumber = this.extractTicketNumberFromCommitMessage(commit.message);
				if (ticketNumber) {
					const isValid = await this.jiraService.validateAuthorAndStatus(ticketNumber, userName, ['In Progress', 'Done']);
					if (isValid) {
						status = 'pass';
						break;
					}
				}
			}
		}

		console.log('Repository:', repository);
		console.log('Ref:', ref);
		console.log('Commits:', commits);
		console.log('Status:', status);
	}

	private extractTicketNumberFromCommitMessage(message: string): string | null {
		const match = message.match(/([A-Z]+-\d+)/);
		return match ? match[1] : null;
	}

	private extractTicketNumberFromRef(ref: string): string | null {
		const match = ref.match(/([A-Z]+-\d+)/);
		return match ? match[1] : null;
	}

	private async handlePullRequestEvent(payload: any): Promise<void> {
		const pullRequest = payload.pull_request;
		const prName = pullRequest.title;
		const userName = pullRequest.user.login;
		const commitsUrl = pullRequest.commits_url;

		// Fetch commits from the commits URL
		const commitsResponse = await fetch(commitsUrl);
		const commits = await commitsResponse.json();

		// Implement your logic to determine pass/fail status
		let status = 'fail';
		if (prName && userName && commits.length > 0) {
			// Add additional checks if needed
			for (const commit of commits) {
				const ticketNumber = this.extractTicketNumberFromCommitMessage(commit.message);
				if (ticketNumber) {
					const isValid = await this.jiraService.validateAuthorAndStatus(ticketNumber, userName, ['In Progress', 'Done']);
					if (isValid) {
						status = 'pass';
						break;
					}
				}
			}
		}

		console.log('PR Name:', prName);
		console.log('User Name:', userName);
		console.log('Commits:', commits);
		console.log('Status:', status);
	}

	private async setStatus(
		owner: string,
		repo: string,
		status: 'in_progress' | 'completed',
		conclusion: 'success' | 'failure',
		sha: string,
		message: string
	): Promise<void> {

		const github_token = process.env.GITHUB_TOKEN;
		if (!github_token) {
			throw new Error('GitHub token is not set');
		}

		// TODO: Update check output based on the checks performed
		const checkOutput = {
			title: 'Jira Integration Bot',
			summary: 'Jira Integration Bot has completed the checks',
			text: message,
		};

		// TODO: Update authentication method to use GitHub App
		const octokit = new Octokit({
			auth: github_token,
		});

		await octokit.request('POST /repos/{owner}/{repo}/check-runs', {
			owner: owner,
			repo: repo,
			name: 'Jira Integration Bot',
			head_sha: sha,
			status: status,
			conclusion: conclusion,
			context: 'Jira Integration Bot',
			output: checkOutput,
			headers: {
				'X-GitHub-Api-Version': '2022-11-28',
			},
		});
	}
}

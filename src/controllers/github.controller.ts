import { Request, Response } from "express";
import { GitHubService } from "../services";

export interface GitHubControllerInterface {
	handleEvent(req: Request, res: Response): void;
}

export class GitHubController implements GitHubControllerInterface {
	constructor(private gitHubService: GitHubService) {}

	async handleEvent(req: Request, res: Response) {
		try {
			await this.gitHubService.handleGitHubEvent(req, res);
		} catch (e) {
			res.status(400).send({
				status: `Failed to handle GitHub event with the following error: ${e.message}`,
			});
		}
	}
}

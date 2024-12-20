import express from "express";
import * as dotenv from "dotenv";
import { GitHubController } from "../controllers";
import { GitHubService } from "../services";

dotenv.config();

export const githubRouter = express.Router();
const githubService = new GitHubService();
const githubController = new GitHubController(githubService);

githubRouter.use(express.urlencoded({ extended: true }));
githubRouter.use(express.json());

githubRouter.post("/webhook", (req, res) => githubController.handleEvent(req, res));
import express from "express";
import * as dotenv from "dotenv";
import { StatusController } from "../controllers";
import { StatusService } from "../services";

dotenv.config();

export const statusRouter = express.Router();
const statusService = new StatusService();
const statusController = new StatusController(statusService);
statusRouter.use(express.urlencoded({ extended: true }));
statusRouter.use(express.json());
statusRouter.get("/", (req, res) => statusController.getStatus(req, res));

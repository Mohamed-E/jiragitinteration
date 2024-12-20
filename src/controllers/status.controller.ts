import { Request, Response } from "express";
import { StatusService } from "../services";

export interface StatusControllerInterface {
  getStatus(_: Request, response: Response): void;
}

export class StatusController implements StatusControllerInterface {
  constructor(private statusService: StatusService) {}

  async getStatus(_: Request, res: Response) {
    try {
      res.json(this.statusService.getStatus()).status(200);
    } catch (e) {
      res.status(400).send({
        status: `Failed to get status with the following error: ${e.message}`,
      });
    }
  }
}

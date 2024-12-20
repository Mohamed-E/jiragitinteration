import { Request, Response } from "express";
import { StatusController } from "./status.controller";

const mockSend = jest.fn();
const mockStatus = jest.fn().mockImplementation(() => ({ send: mockSend }));
const mockJson = jest.fn().mockImplementation(() => ({ status: mockStatus }));
const mockResponse = {
  json: mockJson,
  status: mockStatus,
} as unknown as Response;
const mockRequest = {} as Request;
const mockStatusService = { getStatus: jest.fn() };

describe("Status Controller", () => {
  it("returns status message", async () => {
    const statusController = new StatusController(mockStatusService);
    await statusController.getStatus(mockRequest, mockResponse);
    expect(mockStatusService.getStatus).toHaveBeenCalled();
    expect(mockStatus).toBeCalledWith(200);
  });

  it("returns error message", async () => {
    mockStatusService.getStatus.mockImplementation(() => {
      throw new Error("error");
    });
    const statusController = new StatusController(mockStatusService);
    await statusController.getStatus(mockRequest, mockResponse);
    expect(mockStatus).toBeCalledWith(400);
    expect(mockSend).toBeCalledWith({
      status: "Failed to get status with the following error: error",
    });
  });
});

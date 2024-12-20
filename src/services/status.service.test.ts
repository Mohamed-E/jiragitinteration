import { StatusService } from "./status.service";

describe("Status Service", () => {
  it("should return status message", () => {
    const statusService = new StatusService();
    expect(statusService.getStatus()).toStrictEqual({
      status: "Alive and kicking!",
    });
  });
});

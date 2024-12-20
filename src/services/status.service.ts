export interface StatusServiceInterface {
  getStatus(): { status: string };
}

export class StatusService implements StatusServiceInterface {
  constructor() {}
  public getStatus() {
    return { status: "Alive and kicking!" };
  }
}

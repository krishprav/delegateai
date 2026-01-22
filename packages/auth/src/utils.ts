export class ApiResponse {
  public success: boolean;
  constructor(
    public statusCode: number,
    public message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public data: any
  ) {
    this.success = statusCode < 400;
  }
}

export class CustomError extends Error {
  public data: null;
  public success: boolean;
  constructor(public statusCode: number, message: string) {
    super(message);
    this.success = false;
    this.data = null;
    this.name = "CustomError";
    Error.captureStackTrace(this, this.constructor);
  }
}

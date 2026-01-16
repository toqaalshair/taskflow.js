import { Status } from './executionContext.js';

export class Result {
  constructor({ status, data = null, error = null }) {
    this.status = status;
    this.ok = status === Status.SUCCESS;
    this.data = data;
    this.error = error;
  }

  static success(data) {
    return new Result({ status: Status.SUCCESS, data });
  }

  static failed(error,) {
    return new Result({ status: Status.FAILED, error: String(error || 'Unknown error') });
  }
}

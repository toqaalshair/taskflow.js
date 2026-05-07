import { Status } from './executionContext.js';

export class Result {
  constructor({ status, data = null, error = null, meta = null }) {
    this.status = status;
    this.ok = status === Status.SUCCESS;
    this.data = data;
    this.error = error;
    this.meta = meta;
  }

  static success(data, meta = null) {
    return new Result({ status: Status.SUCCESS, data, meta });
  }

  static failed(error, meta = null) {
    return new Result({ status: Status.FAILED, error: String(error || 'Unknown error'), meta });
  }
}

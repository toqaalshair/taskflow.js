import { Status } from './executionContext.js';

export class Task {
  constructor(label, index) {
    this.index = index;
    this.label = String(label || '').trim();
    this.status = Status.INITIALIZED;
    this.generatedCode = null;
    this.error = null;
  }
}

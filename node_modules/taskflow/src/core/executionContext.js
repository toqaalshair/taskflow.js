// core/executionContext.js
export const Status = Object.freeze({
  INITIALIZED: 'initialized',
  PROMPTING: 'prompting',
  DONE: 'done',
  SUCCESS: 'success',
  FAILED: 'failed'
});

export class ExecutionContext {
  constructor(command, codeContext = '') {
    this.command = command;
    this.codeContext = codeContext;

    this.prompt = null;
    this.generatedCode = null;

    this.status = Status.INITIALIZED;
      this.error = null;
  }
}

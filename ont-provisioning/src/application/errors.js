export class ApplicationError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApplicationError';
    this.status = status;
    this.details = details;
  }
}

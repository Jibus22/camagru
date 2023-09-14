export class DBError extends Error {
  constructor(message, model, cause) {
    super(message);
    this.cause = cause;
    this.model = model;
    this.name = "DBError";
  }
}

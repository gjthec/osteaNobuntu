export class ValidationError extends Error {
  constructor(message = "Validation Error") {
    super(message);
    this.name = "ValidationError";
  }
}

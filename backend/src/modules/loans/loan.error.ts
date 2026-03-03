export class LoanLimitError extends Error {
  public statusCode: number;
  public details: any;

  constructor(details: any) {
    super("Total loan deductions exceed 50% of employee net salary.");
    this.name = "LoanLimitError";
    this.statusCode = 400;
    this.details = details;

    Object.setPrototypeOf(this, LoanLimitError.prototype);
  }
}
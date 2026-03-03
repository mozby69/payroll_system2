export class LoanLimitError extends Error {
    statusCode;
    details;
    constructor(details) {
        super("Total loan deductions exceed 50% of employee net salary.");
        this.name = "LoanLimitError";
        this.statusCode = 400;
        this.details = details;
        Object.setPrototypeOf(this, LoanLimitError.prototype);
    }
}

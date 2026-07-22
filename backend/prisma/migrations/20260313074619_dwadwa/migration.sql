/*
  Warnings:

  - Added the required column `payroll_cycle` to the `main_disburse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `companydetails` ADD COLUMN `isDisburse` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `employee` ADD COLUMN `EndDate` DATE NULL;

-- AlterTable
ALTER TABLE `main_disburse` ADD COLUMN `payroll_cycle` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `company_id` VARCHAR(20) NULL;

-- CreateTable
CREATE TABLE `loan_ledger_logs` (
    `logs_id` INTEGER NOT NULL AUTO_INCREMENT,
    `loan_id` INTEGER NOT NULL,
    `ledger_id` INTEGER NULL,
    `transaction_date` DATE NULL,
    `transaction_type` VARCHAR(50) NULL,
    `debit_amount` DECIMAL(10, 2) NULL,
    `credit_amount` DECIMAL(10, 2) NULL,
    `payment_status` VARCHAR(50) NULL,
    `payroll_cycle` VARCHAR(10) NULL,
    `remarks` VARCHAR(255) NULL,
    `type` ENUM('LEDGER_DELETED', 'LEDGER_DATE_UPDATED') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`logs_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayrollWtaxOverride` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `PayCode` VARCHAR(20) NOT NULL,
    `EmpCodeId` VARCHAR(20) NOT NULL,
    `PayrollPeriod` VARCHAR(50) NOT NULL,
    `computed_value` DECIMAL(12, 2) NOT NULL,
    `edited_value` DECIMAL(12, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PayrollWtaxOverride_PayCode_EmpCodeId_PayrollPeriod_idx`(`PayCode`, `EmpCodeId`, `PayrollPeriod`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companydetails`(`CompanyCode`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_ledger_logs` ADD CONSTRAINT `loan_ledger_logs_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loan_details`(`loan_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollWtaxOverride` ADD CONSTRAINT `PayrollWtaxOverride_PayCode_EmpCodeId_PayrollPeriod_fkey` FOREIGN KEY (`PayCode`, `EmpCodeId`, `PayrollPeriod`) REFERENCES `employee_summary`(`PayCode`, `EmpCode_id`, `PayrollPeriod`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `employee_payroll_archive` ADD COLUMN `disburse_amount` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `loan_details` ADD COLUMN `override_term` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `loan_details_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loan_id` INTEGER NOT NULL,
    `old_payroll_deduct` DECIMAL(10, 2) NOT NULL,
    `old_term_value` INTEGER NOT NULL,
    `old_term_unit` VARCHAR(10) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `employee` ADD COLUMN `isSixDaysWork` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `loan_details` ADD COLUMN `rounding_types` VARCHAR(20) NULL;

-- CreateTable
CREATE TABLE `over_ride_loan` (
    `over_id` INTEGER NOT NULL AUTO_INCREMENT,
    `loan_id` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `credit_amount` DECIMAL(10, 2) NULL,
    `payroll_period` VARCHAR(20) NULL,
    `payroll_cycle` VARCHAR(20) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`over_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `summary_table_override` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `PayCode` VARCHAR(20) NOT NULL,
    `EmpCodeId` VARCHAR(20) NOT NULL,
    `PayrollPeriod` VARCHAR(20) NOT NULL,
    `LateCount` INTEGER NULL,
    `TotalAbsentHours` DECIMAL(10, 2) NULL,
    `TotalUndertime` INTEGER NULL,
    `TotalOvertime` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `summary_table_override_PayCode_EmpCodeId_PayrollPeriod_idx`(`PayCode`, `EmpCodeId`, `PayrollPeriod`),
    UNIQUE INDEX `summary_table_override_PayCode_EmpCodeId_PayrollPeriod_key`(`PayCode`, `EmpCodeId`, `PayrollPeriod`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `over_ride_loan` ADD CONSTRAINT `over_ride_loan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `over_ride_loan` ADD CONSTRAINT `over_ride_loan_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loan_details`(`loan_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `summary_table_override` ADD CONSTRAINT `summary_table_override_PayCode_EmpCodeId_PayrollPeriod_fkey` FOREIGN KEY (`PayCode`, `EmpCodeId`, `PayrollPeriod`) REFERENCES `employee_summary`(`PayCode`, `EmpCode_id`, `PayrollPeriod`) ON DELETE RESTRICT ON UPDATE CASCADE;

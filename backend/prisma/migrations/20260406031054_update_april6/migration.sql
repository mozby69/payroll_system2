-- AlterTable
ALTER TABLE `BonusSummary` ADD COLUMN `batchId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `employee_payroll` ADD COLUMN `excluded_date` DATE NULL,
    ADD COLUMN `gmail_account` VARCHAR(100) NULL,
    ADD COLUMN `include_payroll` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `employee_payroll_archive` ADD COLUMN `PayrollBranchId` VARCHAR(191) NULL,
    ADD COLUMN `pagibig_calamity_loan` DECIMAL(10, 2) NULL;

-- CreateTable
CREATE TABLE `include_payroll_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `PayCode` VARCHAR(20) NOT NULL,
    `CycleCategory` VARCHAR(50) NOT NULL,
    `EmpCode_id` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee_payroll_archive` ADD CONSTRAINT `employee_payroll_archive_PayrollBranchId_fkey` FOREIGN KEY (`PayrollBranchId`) REFERENCES `branches`(`BranchCode`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `include_payroll_logs` ADD CONSTRAINT `include_payroll_logs_EmpCode_id_fkey` FOREIGN KEY (`EmpCode_id`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

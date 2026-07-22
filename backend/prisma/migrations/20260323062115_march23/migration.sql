/*
  Warnings:

  - You are about to drop the column `createdAt` on the `SpecialLeaves` table. All the data in the column will be lost.
  - Added the required column `branchCode` to the `archive_allowance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `SpecialLeaves` DROP COLUMN `createdAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `archive_allowance` ADD COLUMN `branch` VARCHAR(100) NULL,
    ADD COLUMN `branchCode` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `branches` ADD COLUMN `position` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `employee` ADD COLUMN `isAlien` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `secondaryBranchId` VARCHAR(20) NULL;

-- AlterTable
ALTER TABLE `employee_payroll_archive` ADD COLUMN `total_deductions` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `pagibig_list` MODIFY `pagibig_employer_share` DECIMAL(10, 2) NULL DEFAULT 200;

-- AlterTable
ALTER TABLE `total_payroll` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'IN_PROGRESS';

-- CreateTable
CREATE TABLE `payroll_process_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `PayCode` VARCHAR(20) NOT NULL,
    `PayrollPeriod` VARCHAR(50) NOT NULL,
    `CycleCategory` VARCHAR(50) NOT NULL,
    `action` ENUM('REOPEN_TO_CHECKER', 'SAVE_TO_APPROVER', 'SAVE_FINAL_PAYROLL') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `companyCode` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `payroll_process_log_PayCode_PayrollPeriod_CycleCategory_idx`(`PayCode`, `PayrollPeriod`, `CycleCategory`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `allowance_branch_override` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `EmpCode` VARCHAR(191) NOT NULL,
    `selectedMonth` VARCHAR(191) NOT NULL,
    `branchCode` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `allowance_branch_override_EmpCode_selectedMonth_key`(`EmpCode`, `selectedMonth`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `employee_secondaryBranchId_fkey` FOREIGN KEY (`secondaryBranchId`) REFERENCES `branches`(`BranchCode`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payroll_process_log` ADD CONSTRAINT `payroll_process_log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

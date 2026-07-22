/*
  Warnings:

  - Added the required column `totalConversionArchiveId` to the `conversion_archive` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `archive_allowance` ADD COLUMN `base_cash_assistance` DECIMAL(10, 2) NULL,
    ADD COLUMN `base_ecola` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `branches` ADD COLUMN `groupId` INTEGER NULL;

-- AlterTable
ALTER TABLE `conversion_archive` ADD COLUMN `company_id` VARCHAR(20) NULL,
    ADD COLUMN `totalConversionArchiveId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `employee` ADD COLUMN `isOfficerAllowance` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `employee_payroll_archive` ADD COLUMN `officers_allowance` DECIMAL(10, 2) NULL;

-- CreateTable
CREATE TABLE `conversion_total_archive` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `company_id` VARCHAR(20) NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `officersAllowance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `basic_salary` DECIMAL(10, 2) NOT NULL,
    `EmpCode_id` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `officersAllowance_EmpCode_id_key`(`EmpCode_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BranchGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BranchGroup_name_key`(`name`),
    UNIQUE INDEX `BranchGroup_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `branches` ADD CONSTRAINT `branches_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `BranchGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversion_archive` ADD CONSTRAINT `conversion_archive_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companydetails`(`CompanyCode`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversion_archive` ADD CONSTRAINT `conversion_archive_totalConversionArchiveId_fkey` FOREIGN KEY (`totalConversionArchiveId`) REFERENCES `conversion_total_archive`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversion_total_archive` ADD CONSTRAINT `conversion_total_archive_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companydetails`(`CompanyCode`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `officersAllowance` ADD CONSTRAINT `officersAllowance_EmpCode_id_fkey` FOREIGN KEY (`EmpCode_id`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

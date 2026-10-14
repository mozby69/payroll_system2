/*
  Warnings:

  - You are about to drop the `monthly_tax_payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `monthly_tax_payment` DROP FOREIGN KEY `monthly_tax_payment_EmpCodeId_fkey`;

-- AlterTable
ALTER TABLE `employee` ADD COLUMN `CivilStatus` VARCHAR(100) NULL;

-- DropTable
DROP TABLE `monthly_tax_payment`;

-- CreateTable
CREATE TABLE `tax_period` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,

    UNIQUE INDEX `tax_period_month_year_key`(`month`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax_monthly_payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taxAmount` DECIMAL(12, 2) NOT NULL,
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `col1` JSON NULL,
    `col2` JSON NULL,
    `col3` JSON NULL,
    `col4` JSON NULL,
    `month_list` JSON NULL,
    `taxPeriodId` INTEGER NOT NULL,
    `EmpCodeId` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `tax_monthly_payment_EmpCodeId_taxPeriodId_key`(`EmpCodeId`, `taxPeriodId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alert_configuration` (
    `id` INTEGER NOT NULL,
    `isSms` BOOLEAN NOT NULL DEFAULT false,
    `phoneNumber` VARCHAR(191) NULL,
    `isEmail` BOOLEAN NOT NULL DEFAULT false,
    `email` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax_archive` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paycode` VARCHAR(20) NOT NULL,
    `cycle_category` VARCHAR(100) NULL,
    `payroll_period` VARCHAR(100) NULL,
    `grosspay` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `EmpCodeId` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `tax_archive_paycode_EmpCodeId_key`(`paycode`, `EmpCodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tax_monthly_payment` ADD CONSTRAINT `tax_monthly_payment_taxPeriodId_fkey` FOREIGN KEY (`taxPeriodId`) REFERENCES `tax_period`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tax_monthly_payment` ADD CONSTRAINT `tax_monthly_payment_EmpCodeId_fkey` FOREIGN KEY (`EmpCodeId`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tax_archive` ADD CONSTRAINT `tax_archive_EmpCodeId_fkey` FOREIGN KEY (`EmpCodeId`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

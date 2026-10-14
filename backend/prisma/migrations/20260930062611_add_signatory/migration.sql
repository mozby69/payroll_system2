-- AlterTable
ALTER TABLE `employee_payroll` ALTER COLUMN `ecola` DROP DEFAULT;

-- CreateTable
CREATE TABLE `siganatory_list` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `signatory_type` ENUM('PREPARED_BY', 'NOTED_BY', 'CHECKED_BY') NOT NULL,
    `category` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

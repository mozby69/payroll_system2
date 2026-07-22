-- AlterTable
ALTER TABLE `archive_allowance` ADD COLUMN `position` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `summary_table_override` ADD COLUMN `gross_pay_edit` DECIMAL(10, 2) NULL;

-- CreateTable
CREATE TABLE `allowance_archive_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_list` JSON NULL,
    `loans` JSON NULL,
    `variance_allowance` JSON NULL,
    `variance_employee` JSON NULL,
    `selected_month` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `allowance_archive_details` ADD CONSTRAINT `allowance_archive_details_selected_month_fkey` FOREIGN KEY (`selected_month`) REFERENCES `archive_allowance_summary`(`selected_month`) ON DELETE RESTRICT ON UPDATE CASCADE;

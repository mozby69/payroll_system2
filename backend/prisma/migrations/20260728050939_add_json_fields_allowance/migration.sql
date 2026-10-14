/*
  Warnings:

  - You are about to drop the column `company_list` on the `allowance_archive_details` table. All the data in the column will be lost.
  - You are about to drop the column `loans` on the `allowance_archive_details` table. All the data in the column will be lost.
  - You are about to drop the column `variance_allowance` on the `allowance_archive_details` table. All the data in the column will be lost.
  - You are about to drop the column `variance_employee` on the `allowance_archive_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `allowance_archive_details` DROP COLUMN `company_list`,
    DROP COLUMN `loans`,
    DROP COLUMN `variance_allowance`,
    DROP COLUMN `variance_employee`,
    ADD COLUMN `board_mancom_totals` JSON NULL,
    ADD COLUMN `board_member` JSON NULL,
    ADD COLUMN `branches` JSON NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `final_variance` JSON NULL,
    ADD COLUMN `mancom` JSON NULL,
    ADD COLUMN `mh` JSON NULL,
    ADD COLUMN `mh_mancom_loans` JSON NULL,
    ADD COLUMN `mh_totals` JSON NULL,
    ADD COLUMN `total_disburse` JSON NULL,
    ADD COLUMN `total_mh_boardmancom` JSON NULL,
    ADD COLUMN `total_per_company` JSON NULL,
    ADD COLUMN `totalmhAndMancomLoans` JSON NULL,
    ADD COLUMN `variance` JSON NULL,
    ADD COLUMN `variance_emp` JSON NULL;

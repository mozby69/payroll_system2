/*
  Warnings:

  - You are about to drop the column `company_id` on the `employee_variance_category` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `employee_variance_category_company_id_title_key` ON `employee_variance_category`;

-- AlterTable
ALTER TABLE `employee_variance_category` DROP COLUMN `company_id`;

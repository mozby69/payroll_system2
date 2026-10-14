/*
  Warnings:

  - You are about to drop the column `gross_edited` on the `summary_table_override` table. All the data in the column will be lost.
  - You are about to drop the column `gross_pay_edit` on the `summary_table_override` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `summary_table_override` DROP COLUMN `gross_edited`,
    DROP COLUMN `gross_pay_edit`,
    ADD COLUMN `basic_salary` DECIMAL(10, 2) NULL;

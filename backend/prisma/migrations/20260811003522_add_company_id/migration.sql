/*
  Warnings:

  - Added the required column `company_id` to the `variance_archive` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `variance_archive` ADD COLUMN `company_id` VARCHAR(191) NOT NULL;

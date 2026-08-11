/*
  Warnings:

  - A unique constraint covering the columns `[main_archive_id,company_id]` on the table `variance_archive` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paycode,cycle]` on the table `variance_main_archive` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `variance_archive_main_archive_id_company_id_key` ON `variance_archive`(`main_archive_id`, `company_id`);

-- CreateIndex
CREATE UNIQUE INDEX `variance_main_archive_paycode_cycle_key` ON `variance_main_archive`(`paycode`, `cycle`);

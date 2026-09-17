/*
  Warnings:

  - A unique constraint covering the columns `[selected_month]` on the table `allowance_archive_details` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `allowance_archive_details_selected_month_key` ON `allowance_archive_details`(`selected_month`);

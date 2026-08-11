/*
  Warnings:

  - You are about to drop the column `archive_id` on the `variance_main_archive` table. All the data in the column will be lost.
  - Added the required column `main_archive_id` to the `variance_archive` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `variance_main_archive` DROP FOREIGN KEY `variance_main_archive_archive_id_fkey`;

-- DropIndex
DROP INDEX `variance_main_archive_archive_id_fkey` ON `variance_main_archive`;

-- AlterTable
ALTER TABLE `variance_archive` ADD COLUMN `main_archive_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `variance_main_archive` DROP COLUMN `archive_id`;

-- CreateIndex
CREATE INDEX `variance_archive_main_archive_id_idx` ON `variance_archive`(`main_archive_id`);

-- AddForeignKey
ALTER TABLE `variance_archive` ADD CONSTRAINT `variance_archive_main_archive_id_fkey` FOREIGN KEY (`main_archive_id`) REFERENCES `variance_main_archive`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

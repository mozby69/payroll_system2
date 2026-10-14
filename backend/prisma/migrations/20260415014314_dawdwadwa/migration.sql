/*
  Warnings:

  - You are about to drop the column `branch` on the `archive_allowance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `SpecialLeaves` MODIFY `leaveName` ENUM('Maternity', 'Paternity', 'Health', 'SpecialChild') NOT NULL;

-- AlterTable
ALTER TABLE `archive_allowance` DROP COLUMN `branch`;

-- AlterTable
ALTER TABLE `myapp_attendancecount` MODIFY `leave_convert` INTEGER NULL;

-- CreateTable
CREATE TABLE `conversion_as_of_date` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `as_of_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

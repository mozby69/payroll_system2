/*
  Warnings:

  - Added the required column `updated_at` to the `siganatory_list` table without a default value. This is not possible if the table is not empty.
  - Made the column `category` on table `siganatory_list` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `siganatory_list` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `position` VARCHAR(150) NULL,
    ADD COLUMN `sort_order` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `signatory_type` ENUM('PREPARED_BY', 'NOTED_BY', 'CHECKED_BY', 'APPROVED_BY') NOT NULL,
    MODIFY `category` ENUM('BONUS', 'PAYROLL', 'ALLOWANCE') NOT NULL;

-- CreateIndex
CREATE INDEX `siganatory_list_category_signatory_type_is_active_idx` ON `siganatory_list`(`category`, `signatory_type`, `is_active`);

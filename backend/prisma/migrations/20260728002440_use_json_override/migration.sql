/*
  Warnings:

  - You are about to drop the column `LateCount` on the `summary_table_override` table. All the data in the column will be lost.
  - You are about to drop the column `TotalAbsentHours` on the `summary_table_override` table. All the data in the column will be lost.
  - You are about to drop the column `TotalOvertime` on the `summary_table_override` table. All the data in the column will be lost.
  - You are about to drop the column `TotalUndertime` on the `summary_table_override` table. All the data in the column will be lost.
  - You are about to drop the column `basic_salary` on the `summary_table_override` table. All the data in the column will be lost.
  - You are about to drop the column `basic_salary_edited` on the `summary_table_override` table. All the data in the column will be lost.
  - You are about to drop the column `final_wtax` on the `summary_table_override` table. All the data in the column will be lost.
  - You are about to drop the column `philhealth_employee` on the `summary_table_override` table. All the data in the column will be lost.
  - You are about to drop the column `philhealth_employer` on the `summary_table_override` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `summary_table_override` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `summary_table_override` DROP COLUMN `LateCount`,
    DROP COLUMN `TotalAbsentHours`,
    DROP COLUMN `TotalOvertime`,
    DROP COLUMN `TotalUndertime`,
    DROP COLUMN `basic_salary`,
    DROP COLUMN `basic_salary_edited`,
    DROP COLUMN `final_wtax`,
    DROP COLUMN `philhealth_employee`,
    DROP COLUMN `philhealth_employer`,
    ADD COLUMN `changes` JSON NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

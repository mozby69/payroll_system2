-- AlterTable
ALTER TABLE `EmployeeBonus` ADD COLUMN `officerAllowanceAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `regularBonusAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0;

/*
  Warnings:

  - You are about to alter the column `leave_convert` on the `myapp_attendancecount` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,1)`.

*/
-- AlterTable
ALTER TABLE `myapp_attendancecount` MODIFY `leave_convert` DECIMAL(10, 1) NULL;

-- AlterTable
ALTER TABLE `summary_table_override` ADD COLUMN `final_wtax` DECIMAL(10, 2) NULL;

-- CreateTable
CREATE TABLE `manual_employee_summary` (
    `PayCode` VARCHAR(20) NOT NULL,
    `CycleCategory` VARCHAR(50) NOT NULL,
    `PayrollPeriod` VARCHAR(50) NOT NULL,
    `LateCount` INTEGER NULL,
    `TotalAbsentHours` DECIMAL(10, 2) NULL,
    `TotalUndertime` INTEGER NULL,
    `TotalOvertime` DECIMAL(10, 2) NULL,
    `RegularAtt` JSON NULL,
    `OvertimeAtt` JSON NULL,
    `NightShiftAtt` JSON NULL,
    `NightShiftOtAtt` JSON NULL,
    `createdAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NULL,
    `status` VARCHAR(100) NULL DEFAULT 'PENDING',
    `selected_payroll_date` JSON NULL,
    `EmpCode_id` VARCHAR(20) NOT NULL,

    INDEX `manual_employee_summary_PayCode_EmpCode_id_PayrollPeriod_idx`(`PayCode`, `EmpCode_id`, `PayrollPeriod`),
    PRIMARY KEY (`PayCode`, `EmpCode_id`, `PayrollPeriod`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `local_mode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `local_mode` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `manual_employee_summary` ADD CONSTRAINT `manual_employee_summary_EmpCode_id_fkey` FOREIGN KEY (`EmpCode_id`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

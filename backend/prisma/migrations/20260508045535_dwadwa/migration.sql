-- AlterTable
ALTER TABLE `archive_allowance` ADD COLUMN `emergency_allowance_amount` DECIMAL(10, 2) NULL,
    ADD COLUMN `is_emergency` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `archive_allowance_summary` ADD COLUMN `total_emergency_allowance` DECIMAL(10, 2) NULL;

-- CreateTable
CREATE TABLE `allowance_emergency` (
    `allowance_id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_emergency` BOOLEAN NOT NULL DEFAULT false,
    `emergency_allowance_amount` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`allowance_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `allowance_absent_override` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `selected_month` VARCHAR(100) NOT NULL,
    `absent_hours` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `EmpCode_id` VARCHAR(20) NOT NULL,

    INDEX `allowance_absent_override_EmpCode_id_selected_month_idx`(`EmpCode_id`, `selected_month`),
    UNIQUE INDEX `allowance_absent_override_EmpCode_id_selected_month_key`(`EmpCode_id`, `selected_month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `allowance_absent_override` ADD CONSTRAINT `allowance_absent_override_EmpCode_id_fkey` FOREIGN KEY (`EmpCode_id`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

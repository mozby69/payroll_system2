-- AlterTable
ALTER TABLE `loan_details` ADD COLUMN `deduct_first_pay` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `deduct_second_pay` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `conversion_archive` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Sick` INTEGER NOT NULL,
    `Vacation` INTEGER NOT NULL,
    `EmployementDate` DATE NOT NULL,
    `basic_salary` DECIMAL(10, 2) NOT NULL,
    `daily_rate` DECIMAL(10, 2) NOT NULL,
    `tenure` INTEGER NOT NULL,
    `leave_convert` INTEGER NOT NULL,
    `total_leave_for_conversion` INTEGER NOT NULL,
    `leave_amount_for_conversion` DECIMAL(10, 2) NOT NULL,
    `as_of_date` DATE NOT NULL,
    `EmpCode_id` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `conversion_archive_EmpCode_id_key`(`EmpCode_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `conversion_archive` ADD CONSTRAINT `conversion_archive_EmpCode_id_fkey` FOREIGN KEY (`EmpCode_id`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

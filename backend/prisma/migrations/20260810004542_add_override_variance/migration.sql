-- CreateTable
CREATE TABLE `employee_variance_override` (
    `id` INTEGER NOT NULL,
    `EmpCode` VARCHAR(191) NOT NULL,
    `PayCode` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL,
    `cycle` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employee_variance_override_EmpCode_PayCode_company_id_cycle_key`(`EmpCode`, `PayCode`, `company_id`, `cycle`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

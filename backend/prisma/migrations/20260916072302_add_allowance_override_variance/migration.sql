-- CreateTable
CREATE TABLE `allowance_override_remark_variance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `selectedMonth` VARCHAR(191) NOT NULL,
    `empCode` VARCHAR(191) NOT NULL,
    `varianceType` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `allowance_override_remark_variance_selectedMonth_empCode_var_key`(`selectedMonth`, `empCode`, `varianceType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

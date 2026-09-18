-- CreateTable
CREATE TABLE `allowance_ca_ecola_override` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `EmpCodeId` VARCHAR(20) NOT NULL,
    `selectedMonth` VARCHAR(20) NOT NULL,
    `changes` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `allowance_ca_ecola_override_selectedMonth_idx`(`selectedMonth`),
    UNIQUE INDEX `allowance_ca_ecola_override_EmpCodeId_selectedMonth_key`(`EmpCodeId`, `selectedMonth`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `allowance_ca_ecola_override` ADD CONSTRAINT `allowance_ca_ecola_override_EmpCodeId_fkey` FOREIGN KEY (`EmpCodeId`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

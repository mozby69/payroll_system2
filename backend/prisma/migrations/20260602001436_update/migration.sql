-- AlterTable
ALTER TABLE `conversion_as_of_date` ADD COLUMN `company_id` VARCHAR(100) NULL;

-- CreateTable
CREATE TABLE `monthly_tax_payment` (
    `id` VARCHAR(191) NOT NULL,
    `month` VARCHAR(100) NOT NULL,
    `year` VARCHAR(100) NOT NULL,
    `tax_amount` INTEGER NOT NULL,
    `is_paid` BOOLEAN NOT NULL DEFAULT false,
    `EmpCodeId` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `monthly_tax_payment_EmpCodeId_key`(`EmpCodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `monthly_tax_payment` ADD CONSTRAINT `monthly_tax_payment_EmpCodeId_fkey` FOREIGN KEY (`EmpCodeId`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

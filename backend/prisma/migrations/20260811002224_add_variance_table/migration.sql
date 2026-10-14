-- CreateTable
CREATE TABLE `variance_archive` (
    `id` VARCHAR(191) NOT NULL,
    `company_variance` JSON NOT NULL,
    `employee_variance` JSON NULL,
    `final_variance` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `variance_main_archive` (
    `id` VARCHAR(191) NOT NULL,
    `paycode` VARCHAR(191) NOT NULL,
    `cycle` VARCHAR(191) NOT NULL,
    `archive_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `variance_main_archive` ADD CONSTRAINT `variance_main_archive_archive_id_fkey` FOREIGN KEY (`archive_id`) REFERENCES `variance_archive`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

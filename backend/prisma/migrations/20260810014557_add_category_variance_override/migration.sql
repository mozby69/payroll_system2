-- CreateTable
CREATE TABLE `employee_variance_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `employee_variance_category_company_id_title_key`(`company_id`, `title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

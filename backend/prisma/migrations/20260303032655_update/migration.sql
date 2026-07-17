-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserRole` (
    `userId` INTEGER NOT NULL,
    `roleId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Permission_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolePermission` (
    `roleId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,

    PRIMARY KEY (`roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branches` (
    `BranchCode` VARCHAR(20) NOT NULL,
    `Company` VARCHAR(50) NULL,
    `Location` VARCHAR(50) NULL,
    `Employees` VARCHAR(10) NULL,
    `BranchImage` VARCHAR(100) NULL,
    `company_id` VARCHAR(20) NULL,

    PRIMARY KEY (`BranchCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee` (
    `EmpCode` VARCHAR(20) NOT NULL,
    `IdNo` VARCHAR(5) NULL,
    `Firstname` VARCHAR(20) NULL,
    `Middlename` VARCHAR(20) NULL,
    `Lastname` VARCHAR(20) NULL,
    `Suffix` VARCHAR(5) NULL,
    `DateofBirth` DATE NULL,
    `Position` VARCHAR(50) NULL,
    `Department` VARCHAR(50) NULL,
    `EmployementDate` DATE NULL,
    `EmploymentStatus` VARCHAR(15) NULL,
    `EmployeeStatus` VARCHAR(15) NULL,
    `WithATM` BOOLEAN NOT NULL DEFAULT false,
    `Disburse` BOOLEAN NOT NULL DEFAULT false,
    `Taxable` BOOLEAN NOT NULL DEFAULT false,
    `isNewEmployee` BOOLEAN NOT NULL DEFAULT false,
    `bod_member` VARCHAR(100) NULL,
    `BranchCode_id` VARCHAR(20) NULL,

    PRIMARY KEY (`EmpCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_details` (
    `Payrollid` INTEGER NOT NULL AUTO_INCREMENT,
    `EmpTin` VARCHAR(30) NULL,
    `EmpSSSNo` VARCHAR(30) NULL,
    `EmpPhilhlthNo` VARCHAR(30) NULL,
    `EmpPagibigNo` VARCHAR(30) NULL,
    `EmpChildrenName` VARCHAR(50) NULL,
    `EmpChildrenBirthday` DATE NULL,
    `EmpChildrenBplace` VARCHAR(50) NULL,
    `EmpCodeId` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `employee_details_EmpCodeId_key`(`EmpCodeId`),
    PRIMARY KEY (`Payrollid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_summary` (
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

    INDEX `employee_summary_PayCode_EmpCode_id_PayrollPeriod_idx`(`PayCode`, `EmpCode_id`, `PayrollPeriod`),
    PRIMARY KEY (`PayCode`, `EmpCode_id`, `PayrollPeriod`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `total_payroll` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paycycle` VARCHAR(20) NOT NULL,
    `cycle_category` VARCHAR(100) NULL,
    `payroll_period` VARCHAR(100) NULL,
    `total_grosspay` DECIMAL(10, 2) NULL,
    `total_netpay` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(3) NULL,
    `total_late` DECIMAL(10, 2) NULL,
    `total_absent` DECIMAL(10, 2) NULL,
    `total_overtime` DECIMAL(10, 2) NULL,
    `total_sss_contribution_employee` DECIMAL(10, 2) NULL,
    `total_sss_contribution_employer` DECIMAL(10, 2) NULL,
    `total_pagibig_contribution_employee` DECIMAL(10, 2) NULL,
    `total_pagibig_contribution_employer` DECIMAL(10, 2) NULL,
    `total_philhealth_employee` DECIMAL(10, 2) NULL,
    `total_philhealth_employer` DECIMAL(10, 2) NULL,
    `total_wtax` DECIMAL(10, 2) NULL,
    `total_basic` DECIMAL(10, 2) NULL,
    `selected_payroll_date` JSON NULL,
    `total_undertime` DECIMAL(10, 2) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `total_payroll_by_company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paycycle` VARCHAR(20) NOT NULL,
    `cycle_category` VARCHAR(100) NULL,
    `payroll_period` VARCHAR(100) NULL,
    `total_grosspay` DECIMAL(10, 2) NULL,
    `total_netpay` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(3) NULL,
    `total_late` DECIMAL(10, 2) NULL,
    `total_absent` DECIMAL(10, 2) NULL,
    `total_overtime` DECIMAL(10, 2) NULL,
    `total_sss_contribution_employee` DECIMAL(10, 2) NULL,
    `total_sss_contribution_employer` DECIMAL(10, 2) NULL,
    `total_pagibig_contribution_employee` DECIMAL(10, 2) NULL,
    `total_pagibig_contribution_employer` DECIMAL(10, 2) NULL,
    `total_philhealth_employee` DECIMAL(10, 2) NULL,
    `total_philhealth_employer` DECIMAL(10, 2) NULL,
    `total_wtax` DECIMAL(10, 2) NULL,
    `total_basic` DECIMAL(10, 2) NULL,
    `selected_payroll_date` JSON NULL,
    `total_undertime` DECIMAL(10, 2) NULL,
    `total_payroll_id` INTEGER NOT NULL,
    `company_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_payroll` (
    `payroll_id` INTEGER NOT NULL AUTO_INCREMENT,
    `basic_salary` DECIMAL(10, 2) NOT NULL,
    `cash_assistance` DECIMAL(10, 2) NULL,
    `ecola` DECIMAL(10, 2) NULL DEFAULT 500,
    `with_ecola` BOOLEAN NULL DEFAULT true,
    `bank_account` VARCHAR(200) NULL,
    `EmpCodeId` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `employee_payroll_EmpCodeId_key`(`EmpCodeId`),
    PRIMARY KEY (`payroll_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_account_admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `funding_account` VARCHAR(200) NOT NULL,
    `company_code` VARCHAR(100) NULL,
    `batch` VARCHAR(50) NULL,
    `bank_name` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagibig_list` (
    `pagibig_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pagibig_employee_share` DECIMAL(10, 2) NULL,
    `pagibig_employer_share` DECIMAL(10, 2) NULL,
    `EmpCode_id` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `pagibig_list_EmpCode_id_key`(`EmpCode_id`),
    PRIMARY KEY (`pagibig_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sss_contributions` (
    `sss_contrib_id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_range` DECIMAL(10, 2) NULL,
    `end_range` DECIMAL(10, 2) NULL,
    `employer_share` DECIMAL(10, 2) NULL,
    `employee_share` DECIMAL(10, 2) NULL,

    PRIMARY KEY (`sss_contrib_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payroll_parameters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `SettingName` VARCHAR(100) NULL,
    `SettingPercentage` DECIMAL(10, 3) NULL,
    `LastModifiedBy` VARCHAR(100) NULL,
    `LastModifiedDate` DATE NULL,
    `Created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_payroll_archive` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `PayCode` VARCHAR(20) NOT NULL,
    `late` DECIMAL(10, 2) NULL,
    `absent` DECIMAL(10, 2) NULL,
    `cycle_category` VARCHAR(100) NULL,
    `payroll_period` VARCHAR(100) NULL,
    `selected_payroll_date` VARCHAR(100) NULL,
    `undertime` DECIMAL(10, 2) NULL,
    `overtime` DECIMAL(10, 2) NULL,
    `grosspay` DECIMAL(10, 2) NULL,
    `w_tax` DECIMAL(10, 2) NULL,
    `netpay` DECIMAL(10, 2) NULL,
    `basic_salary` DECIMAL(10, 2) NULL,
    `sss_employee_share` DECIMAL(10, 2) NULL,
    `sss_employer_share` DECIMAL(10, 2) NULL,
    `pagibig_employee_share` DECIMAL(10, 2) NULL,
    `pagibig_employer_share` DECIMAL(10, 2) NULL,
    `philhealth_employee_share` DECIMAL(10, 2) NULL,
    `philhealth_employer_share` DECIMAL(10, 2) NULL,
    `ar_e` DECIMAL(10, 2) NULL,
    `fch_loan` DECIMAL(10, 2) NULL,
    `rfc_loan` DECIMAL(10, 2) NULL,
    `pagibig_loan` DECIMAL(10, 2) NULL,
    `sss_loan` DECIMAL(10, 2) NULL,
    `sss_calamity_loan` DECIMAL(10, 2) NULL,
    `isNewEmployee` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total_payroll_id` INTEGER NOT NULL,
    `EmpCode_id` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `employee_payroll_archive_PayCode_EmpCode_id_key`(`PayCode`, `EmpCode_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companydetails` (
    `CompanyCode` VARCHAR(20) NOT NULL,
    `CompanyCycle` VARCHAR(50) NULL,
    `CompanyName` VARCHAR(50) NULL,

    PRIMARY KEY (`CompanyCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loan_details` (
    `loan_id` INTEGER NOT NULL AUTO_INCREMENT,
    `principal` DECIMAL(10, 2) NOT NULL,
    `loan_type` VARCHAR(100) NOT NULL,
    `term_value` INTEGER NOT NULL,
    `term_unit` VARCHAR(10) NOT NULL,
    `start_date` DATE NOT NULL,
    `deduct_allowance` BOOLEAN NOT NULL DEFAULT true,
    `per_payroll_deduct` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cycle_category` VARCHAR(20) NULL,
    `extended_term` DECIMAL(10, 1) NOT NULL DEFAULT 0,
    `others_types` VARCHAR(50) NULL,
    `EmpCodeId` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`loan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loan_ledger` (
    `loan_ledger_id` INTEGER NOT NULL AUTO_INCREMENT,
    `loan_id` INTEGER NOT NULL,
    `transaction_date` DATE NOT NULL,
    `transaction_type` VARCHAR(50) NOT NULL,
    `debit_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `credit_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `remarks` VARCHAR(255) NULL,
    `payment_status` VARCHAR(50) NULL,
    `payroll_cycle` VARCHAR(10) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `EmpCodeId` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`loan_ledger_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BonusRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `bonusType` ENUM('QUARTERLY', 'MIDYEAR', 'ANNUAL', 'SPECIAL') NOT NULL,
    `eligibleMonth` INTEGER NOT NULL,
    `minTenureYear` INTEGER NOT NULL,
    `formulaType` ENUM('BASIC_DIV_2', 'BASIC_DIV_1', 'CUSTOM') NOT NULL,
    `taxable` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `version` INTEGER NOT NULL DEFAULT 1,
    `parentRuleId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `BonusRule_code_version_key`(`code`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeBonus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeCode` VARCHAR(191) NOT NULL,
    `bonusRuleId` INTEGER NOT NULL,
    `bonusSummaryId` INTEGER NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `generatedForMonth` INTEGER NOT NULL,
    `releasePeriod` VARCHAR(191) NOT NULL,
    `status` ENUM('GENERATED', 'PENDING', 'APPROVED', 'RELEASED', 'CANCELLED', 'RESET') NOT NULL DEFAULT 'GENERATED',
    `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `loanDeduction` DECIMAL(12, 2) NOT NULL,
    `netAmount` DECIMAL(12, 2) NOT NULL,
    `paidAt` DATETIME(3) NULL,
    `hasLeave` BOOLEAN NOT NULL DEFAULT false,
    `remarks` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `resetAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NULL,

    INDEX `EmployeeBonus_employeeCode_idx`(`employeeCode`),
    INDEX `EmployeeBonus_bonusRuleId_idx`(`bonusRuleId`),
    INDEX `EmployeeBonus_bonusSummaryId_idx`(`bonusSummaryId`),
    INDEX `EmployeeBonus_generatedForMonth_releasePeriod_bonusSummaryId_idx`(`generatedForMonth`, `releasePeriod`, `bonusSummaryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BonusSummary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bonusRuleId` INTEGER NOT NULL,
    `releasePeriod` VARCHAR(191) NOT NULL,
    `asOfDate` DATETIME(3) NOT NULL,
    `generateDate` DATETIME(3) NOT NULL,
    `totalEmployees` INTEGER NULL,
    `totalAmount` DECIMAL(14, 2) NULL,
    `status` ENUM('GENERATED', 'PENDING', 'APPROVED', 'RELEASED', 'CANCELLED', 'RESET') NOT NULL DEFAULT 'GENERATED',
    `approvedById` INTEGER NULL,
    `approvedDate` DATETIME(3) NULL,
    `releasedById` INTEGER NULL,
    `releasedDate` DATETIME(3) NULL,
    `resetAt` DATETIME(3) NULL,
    `rejectedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `module` ENUM('BONUS', 'PAYROLL', 'USER', 'VEHICLE') NOT NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'RELEASE', 'GENERATE') NOT NULL,
    `referenceId` INTEGER NOT NULL,
    `referenceCode` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `performedById` INTEGER NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_module_idx`(`module`),
    INDEX `AuditLog_referenceId_idx`(`referenceId`),
    INDEX `AuditLog_performedById_idx`(`performedById`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BonusRuleCompany` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bonusRuleId` INTEGER NOT NULL,
    `companyCode` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `BonusRuleCompany_bonusRuleId_companyCode_key`(`bonusRuleId`, `companyCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `current_date` DATETIME(3) NULL,
    `status` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax_tables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_range` INTEGER NULL,
    `end_range` INTEGER NULL,
    `annual_base_tax_bracket` DECIMAL(10, 2) NULL,
    `rate_per_bracket` DECIMAL(10, 2) NULL,
    `annual_base_tax_per_year` DECIMAL(10, 2) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `archive_allowance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `EmpCodeId` VARCHAR(20) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `cash_allowance` DECIMAL(10, 2) NULL,
    `ecola` DECIMAL(10, 2) NULL,
    `absent_count` DECIMAL(10, 2) NULL,
    `deduct` DECIMAL(10, 2) NULL,
    `total` DECIMAL(10, 2) NULL,
    `loan` DECIMAL(10, 2) NULL,
    `total_deduction` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `selected_month` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `archive_allowance_EmpCodeId_selected_month_key`(`EmpCodeId`, `selected_month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `archive_allowance_summary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `allowance_name` VARCHAR(100) NOT NULL,
    `selected_month` VARCHAR(200) NOT NULL,
    `total_cash_allowance` DECIMAL(10, 2) NULL,
    `total_ecola` DECIMAL(10, 2) NULL,
    `grand_total` DECIMAL(10, 2) NULL,
    `totalAbsent` DECIMAL(10, 2) NULL,
    `totalLoan` DECIMAL(10, 2) NULL,
    `total_deduction` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `archive_allowance_summary_selected_month_key`(`selected_month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_salary_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `EmpCodeId` VARCHAR(20) NOT NULL,
    `old_salary` DECIMAL(10, 2) NOT NULL,
    `new_salary` DECIMAL(10, 2) NOT NULL,
    `remarks` VARCHAR(255) NOT NULL,
    `salary_type` ENUM('Basic', 'Allowance', 'Ecola') NOT NULL,
    `changed_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BodPhilhealtContrib` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_share` DECIMAL(10, 2) NULL,
    `EmpCodeId` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `main_disburse` (
    `mainDisburseID` INTEGER NOT NULL AUTO_INCREMENT,
    `type_disburse` VARCHAR(50) NOT NULL,
    `payroll_period` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `status` ENUM('APPROVED', 'AWAITING', 'REJECTED') NOT NULL DEFAULT 'AWAITING',
    `totalDisburse` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`mainDisburseID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emp_disburse` (
    `disburseID` INTEGER NOT NULL AUTO_INCREMENT,
    `emp_archive_id` INTEGER NOT NULL,
    `main_disburse_id` INTEGER NOT NULL,

    UNIQUE INDEX `emp_disburse_emp_archive_id_key`(`emp_archive_id`),
    PRIMARY KEY (`disburseID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SpecialLeaves` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leaveName` ENUM('Maternity', 'Paternity', 'Health') NOT NULL,
    `start` DATE NULL,
    `end` DATE NULL,
    `expectedStart` DATE NULL,
    `expectedEnd` DATE NULL,
    `status` ENUM('Active', 'Completed', 'Expected') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `empCodeId` VARCHAR(191) NOT NULL,

    INDEX `SpecialLeaves_empCodeId_idx`(`empCodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `myapp_attendancecount` (
    `ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Vacation` DECIMAL(10, 2) NOT NULL,
    `Sick` DECIMAL(10, 2) NOT NULL,
    `leave_convert` BOOLEAN NOT NULL DEFAULT false,
    `EmpCode_id` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `myapp_attendancecount_EmpCode_id_key`(`EmpCode_id`),
    PRIMARY KEY (`ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserRole` ADD CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branches` ADD CONSTRAINT `branches_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companydetails`(`CompanyCode`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `employee_BranchCode_id_fkey` FOREIGN KEY (`BranchCode_id`) REFERENCES `branches`(`BranchCode`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_details` ADD CONSTRAINT `employee_details_EmpCodeId_fkey` FOREIGN KEY (`EmpCodeId`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_summary` ADD CONSTRAINT `employee_summary_EmpCode_id_fkey` FOREIGN KEY (`EmpCode_id`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `total_payroll_by_company` ADD CONSTRAINT `total_payroll_by_company_total_payroll_id_fkey` FOREIGN KEY (`total_payroll_id`) REFERENCES `total_payroll`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `total_payroll_by_company` ADD CONSTRAINT `total_payroll_by_company_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companydetails`(`CompanyCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_payroll` ADD CONSTRAINT `employee_payroll_EmpCodeId_fkey` FOREIGN KEY (`EmpCodeId`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagibig_list` ADD CONSTRAINT `pagibig_list_EmpCode_id_fkey` FOREIGN KEY (`EmpCode_id`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_payroll_archive` ADD CONSTRAINT `employee_payroll_archive_total_payroll_id_fkey` FOREIGN KEY (`total_payroll_id`) REFERENCES `total_payroll`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_payroll_archive` ADD CONSTRAINT `employee_payroll_archive_EmpCode_id_fkey` FOREIGN KEY (`EmpCode_id`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_details` ADD CONSTRAINT `loan_details_EmpCodeId_fkey` FOREIGN KEY (`EmpCodeId`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_ledger` ADD CONSTRAINT `loan_ledger_EmpCodeId_fkey` FOREIGN KEY (`EmpCodeId`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_ledger` ADD CONSTRAINT `loan_ledger_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loan_details`(`loan_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BonusRule` ADD CONSTRAINT `BonusRule_parentRuleId_fkey` FOREIGN KEY (`parentRuleId`) REFERENCES `BonusRule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeBonus` ADD CONSTRAINT `EmployeeBonus_employeeCode_fkey` FOREIGN KEY (`employeeCode`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeBonus` ADD CONSTRAINT `EmployeeBonus_bonusRuleId_fkey` FOREIGN KEY (`bonusRuleId`) REFERENCES `BonusRule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeBonus` ADD CONSTRAINT `EmployeeBonus_bonusSummaryId_fkey` FOREIGN KEY (`bonusSummaryId`) REFERENCES `BonusSummary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BonusSummary` ADD CONSTRAINT `BonusSummary_bonusRuleId_fkey` FOREIGN KEY (`bonusRuleId`) REFERENCES `BonusRule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BonusSummary` ADD CONSTRAINT `BonusSummary_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BonusSummary` ADD CONSTRAINT `BonusSummary_releasedById_fkey` FOREIGN KEY (`releasedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BonusSummary` ADD CONSTRAINT `BonusSummary_rejectedById_fkey` FOREIGN KEY (`rejectedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BonusRuleCompany` ADD CONSTRAINT `BonusRuleCompany_bonusRuleId_fkey` FOREIGN KEY (`bonusRuleId`) REFERENCES `BonusRule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BonusRuleCompany` ADD CONSTRAINT `BonusRuleCompany_companyCode_fkey` FOREIGN KEY (`companyCode`) REFERENCES `companydetails`(`CompanyCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `archive_allowance` ADD CONSTRAINT `archive_allowance_selected_month_fkey` FOREIGN KEY (`selected_month`) REFERENCES `archive_allowance_summary`(`selected_month`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `archive_allowance` ADD CONSTRAINT `archive_allowance_EmpCodeId_fkey` FOREIGN KEY (`EmpCodeId`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_salary_history` ADD CONSTRAINT `employee_salary_history_EmpCodeId_fkey` FOREIGN KEY (`EmpCodeId`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BodPhilhealtContrib` ADD CONSTRAINT `BodPhilhealtContrib_EmpCodeId_fkey` FOREIGN KEY (`EmpCodeId`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emp_disburse` ADD CONSTRAINT `emp_disburse_emp_archive_id_fkey` FOREIGN KEY (`emp_archive_id`) REFERENCES `employee_payroll_archive`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emp_disburse` ADD CONSTRAINT `emp_disburse_main_disburse_id_fkey` FOREIGN KEY (`main_disburse_id`) REFERENCES `main_disburse`(`mainDisburseID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SpecialLeaves` ADD CONSTRAINT `SpecialLeaves_empCodeId_fkey` FOREIGN KEY (`empCodeId`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `myapp_attendancecount` ADD CONSTRAINT `myapp_attendancecount_EmpCode_id_fkey` FOREIGN KEY (`EmpCode_id`) REFERENCES `employee`(`EmpCode`) ON DELETE RESTRICT ON UPDATE CASCADE;

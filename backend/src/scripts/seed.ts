import { prisma } from "../config/prismaClient"

async function main() {
  const permissions = [
    { code: "BONUS_VIEW", name: "Access Bonus" },
    { code: "BONUS_GENERATE", name: "Generate Bonus" },
    { code: "BONUS_APPROVE", name: "Approve Bonus" },
    { code: "BONUS_RELEASE", name: "Release Bonus" },
    { code: "BONUS_ARCHIVE", name: "Archive Bonus" },
    { code: "BONUS_ARCHIVE_VIEW", name: "View Archived Bonuses" },
    { code: "BONUS_RULES_MANAGE", name: "Configure Bonus Rules" },

    { code: "PAYROLL_VIEW", name: "View Payroll Compuation" },
    { code: "PAYROLL_RUN", name: "View Run Payroll" },
    { code: "PAYROLL_ARCHIVE", name: "View Payroll Archive" },
    { code: "PAYROLL_LIST", name: "View Payroll List" },
    { code: "SAVE_PAYROLL", name: "Save Payroll" },
    { code: "PAYROLL_INITIALIZE", name: "Payroll Initialize" },

    { code: "SAVE_TO_APPROVER", name: "Save Payroll to Approver" },
    { code: "SAVE_FINAL_PAYROLL", name: "Save Final Payroll" },

    { code: "VIEW_LOANS", name: "View Loans" },

    { code: "USER_MANAGE", name: "Manage Users" },
    { code: "ADMIN_MANAGE", name: "Manage Admin" }
  ]

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p
    })
  }

  const roles = [
    { name: "ADMIN", permissions: permissions.map(p => p.code) },
    { name: "PAYROLL_ADMIN", permissions: ["PAYROLL_INITIALIZE"] },
    { name: "PAYROLL_CHECKER", permissions: ["PAYROLL_RUN"] },

    { name: "FINANCIAL_CHECKER", permissions: ["PAYROLL_LIST"] },
    { name: "FINANCE_APPROVER", permissions: ["PAYROLL_LIST"] },

    { name: "APPROVER", permissions: ["BONUS_APPROVE"] },

  ]

  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name }
    })

    for (const code of role.permissions) {
      const permission = await prisma.permission.findUnique({ where: { code } })

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: createdRole.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            roleId: createdRole.id,
            permissionId: permission.id
          }
        })
      }
    }
  }

  console.log("Roles & permissions seeded")
}

main()

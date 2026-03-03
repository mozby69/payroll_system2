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
    { name: "PAYROLL", permissions: ["PAYROLL_VIEW"] },
    { name: "APPROVER", permissions: ["BONUS_APPROVE"] },
    { name: "FINANCE", permissions: ["PAYROLL_VIEW"] }
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

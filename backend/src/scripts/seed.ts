import { prisma } from "../config/prismaClient"

async function main() {
  const permissions = [
    { code: "BONUS_GENERATE", name: "Generate Bonus" },
    { code: "BONUS_APPROVE", name: "Approve Bonus" },
    { code: "BONUS_RELEASE", name: "Release Bonus" },
    { code: "BONUS_RESET", name: "Reset Bonus" },
    { code: "USER_MANAGE", name: "Manage Users" }
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
    { name: "PAYROLL", permissions: ["BONUS_GENERATE"] },
    { name: "APPROVER", permissions: ["BONUS_APPROVE"] },
    { name: "FINANCE", permissions: ["BONUS_RELEASE"] }
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

import { PrismaClient, AuditModule, AuditAction } from "@prisma/client"

const prisma = new PrismaClient()

interface AuditParams {
  module: AuditModule
  action: AuditAction
  referenceId: number
  performedById: number
  description?: string
  metadata?: any
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(
  tx: PrismaClient | any,
  params: AuditParams
) {
  await tx.auditLog.create({
    data: {
      module: params.module,
      action: params.action,
      referenceId: params.referenceId,
      performedById: params.performedById,
      description: params.description,
      metadata: params.metadata,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent
    }
  })
}

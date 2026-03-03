import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function createAuditLog(tx, params) {
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
    });
}

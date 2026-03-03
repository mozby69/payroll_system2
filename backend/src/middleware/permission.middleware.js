import { prisma } from "../config/prismaClient";
export function requirePermission(permissionCode) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        const userId = req.user.id;
        const permissions = await prisma.userRole.findMany({
            where: { userId },
            select: {
                role: {
                    select: {
                        permissions: {
                            select: {
                                permission: {
                                    select: {
                                        code: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        const hasPermission = permissions.some(ur => ur.role.permissions.some(rp => rp.permission.code === permissionCode));
        if (!hasPermission) {
            return res.status(403).json({
                message: "Forbidden: Insufficient permissions"
            });
        }
        next();
    };
}

import { prisma } from "../../config/prismaClient";
export async function me(req, res) {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            roles: {
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    // Flatten permissions
    const permissions = user.roles.flatMap(r => r.role.permissions.map(p => p.permission.code));
    const roles = user.roles.map(r => r.role.name);
    res.json({
        id: user.id,
        username: user.username,
        roles,
        permissions
    });
}
export function logout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });
    res.sendStatus(200);
}

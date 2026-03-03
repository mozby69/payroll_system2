// import { Request, Response } from "express";
// import { loginUser } from "./login.services";
// import { LoginDTO } from "./login.types";
import { createUserService, getPermissionService, getRoleService, getUsersService, loginUser, updateRolePermissionsService, updateUserService } from "./login.services";
import { createUserSchema, updateUserSchema } from "./login.schema";
export async function loginController(req, res) {
    try {
        const { token, user } = await loginUser(req.body);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(401).json({
            message: error?.message ?? "Login failed",
        });
    }
}
export async function createUserController(req, res) {
    try {
        //  Validate request body
        const parsed = createUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.format()
            });
        }
        const { email, name, username, password, roleIds } = parsed.data;
        // Create user + roles (transaction)
        const user = await createUserService({
            email,
            name,
            username,
            password,
            roleIds
        });
        //  Do NOT return password
        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.username,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        });
    }
    catch (err) {
        if (err.message === "USER_ALREADY_EXISTS") {
            return res.status(400).json({ message: "User already exists" });
        }
        if (err.message === "INVALID_ROLE") {
            return res.status(400).json({ message: "Invalid role selected" });
        }
        res.status(500).json({ message: "Failed to create user" });
    }
}
export async function updateUserController(req, res) {
    const userId = Number(req.params.id);
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(parsed.error.format());
    }
    const user = await updateUserService(userId, parsed.data);
    res.json({ message: "User updated", user });
}
export async function getRoleController(req, res) {
    try {
        const roles = await getRoleService();
        return res.status(200).json(roles);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch user roles"
        });
    }
}
export async function getPermissionController(req, res) {
    try {
        const roles = await getPermissionService();
        return res.status(200).json(roles);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch user roles"
        });
    }
}
export async function getUsersController(req, res) {
    try {
        const users = await getUsersService();
        return res.status(200).json(users);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch users"
        });
    }
}
export async function updateRolePermissionsController(req, res) {
    try {
        const roleId = Number(req.params.id);
        const { permissionIds } = req.body;
        if (!Array.isArray(permissionIds)) {
            return res.status(400).json({
                message: "permissionIds must be an array"
            });
        }
        await updateRolePermissionsService(roleId, permissionIds);
        res.json({ message: "Permissions updated successfully" });
    }
    catch (err) {
        if (err.message === "ROLE_NOT_FOUND") {
            return res.status(404).json({ message: "Role not found" });
        }
        res.status(500).json({
            message: "Failed to update permissions"
        });
    }
}

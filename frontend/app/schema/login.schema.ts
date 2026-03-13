import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;


export const registerSchema = z.object({
  email: z.string().email("Invalid email").optional(),

  name: z.string().min(2, "Name is required"),

  username: z.string().min(3, "Username must be at least 3 characters"),

  password: z.string().min(8, "Password must be at least 8 characters").optional(),

  roleIds: z.array(z.number().int().positive())
    .min(1, "At least one role is required"),
    
    company_id: z.string().optional(),
})

export type RegisterSchema = z.infer<typeof registerSchema>

export const updateUserSchema = registerSchema
  .omit({ password: true })
  .extend({
    password: z.string().min(8).optional()
  })

export type UpdateUserSchema = z.infer<typeof updateUserSchema>
import z from "zod";

export const createAlertSchema = z.object({
    isSms: z.boolean(),
  
    phoneNumber: z
      .string()
      .trim()
      .optional()
      .nullable(),
  
    isEmail: z.boolean(),
  
    email: z
      .email("Invalid email address")
      .optional()
      .nullable(),
  }).superRefine((data, ctx) => {
    if (data.isSms && !data.phoneNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phoneNumber"],
        message: "Phone number is required when SMS is enabled",
      });
    }
  
    if (data.isEmail && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Email is required when Email is enabled",
      });
    }
  });
  
  export type CreateAlertSchema = z.infer<typeof createAlertSchema>;
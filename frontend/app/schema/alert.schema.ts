import z from "zod";

export const createAlertSchema = z
  .object({
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
  })
  .superRefine((data, ctx) => {
    if (data.isSms) {
      if (!data.phoneNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phoneNumber"],
          message: "Phone number is required",
        });
      } else {
        if (!/^\d+$/.test(data.phoneNumber)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["phoneNumber"],
            message: "Phone number must contain numbers only",
          });
        }

        if (data.phoneNumber.length !== 11) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["phoneNumber"],
            message: "Phone number must be exactly 11 digits",
          });
        }
      }
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
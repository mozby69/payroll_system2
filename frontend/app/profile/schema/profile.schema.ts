import { z } from "zod";

export const payrollSchema = z.object({
  basicSalary: z.coerce.number().min(0),
  cashAssistance: z.coerce.number().min(0),
  ecola: z.coerce.number().min(0),
});

export type PayrollFormValues = z.infer<typeof payrollSchema>;

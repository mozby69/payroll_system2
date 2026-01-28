import { BonusType, FormulaType } from "@prisma/client";
import z from "zod";




export const createBonusRuleSchema = z.object({
    code: z.string().min(3).max(20),
    name: z.string().min(3),
    bonusType: z.nativeEnum(BonusType),

    eligibleMonth: z.number().int().min(0).max(12),

    minTenureMonths: z.number().int().min(0),

    formulaType: z.nativeEnum(FormulaType),

    taxable: z.boolean().optional().default(false)

})


export type CreateBonusRuleInput = z.infer<typeof createBonusRuleSchema>


export const updateBonusRuleSchema = z.object({
    code: z.string().min(3).max(20).optional(),
    name: z.string().min(3).optional(),
    bonusType: z.nativeEnum(BonusType).optional(),
    eligibleMonth: z.number().int().min(1).max(12).optional(),
    minTenureMonths: z.number().int().min(0).optional(),
    formulaType: z.nativeEnum(FormulaType).optional(),
    taxable: z.boolean().optional()
  }) 
  
  export type UpdateBonusRuleInput = z.infer<typeof updateBonusRuleSchema>
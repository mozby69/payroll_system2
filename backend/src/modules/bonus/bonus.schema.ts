import { BonusType, FormulaType } from "@prisma/client";
import z from "zod";




export const createBonusRuleSchema = z.object({
    code: z.string().min(3).max(20),
    name: z.string().min(3),
    bonusType: z.nativeEnum(BonusType),

    eligibleMonth: z.number().int().min(0).max(12),

    minTenureYear: z.number().int().min(0),

    formulaType: z.nativeEnum(FormulaType),

    taxable: z.boolean().optional().default(false)

})


export type CreateBonusRuleInput = z.infer<typeof createBonusRuleSchema>


export const updateBonusRuleSchema = z.object({
    code: z.string().min(3).max(20).optional(),
    name: z.string().min(3).optional(),
    bonusType: z.nativeEnum(BonusType).optional(),
    eligibleMonth: z.number().int().min(1).max(12).optional(),
    minTenureYear: z.number().int().min(0).optional(),
    formulaType: z.nativeEnum(FormulaType).optional(),
    taxable: z.boolean().optional()
  }) 
  
  export type UpdateBonusRuleInput = z.infer<typeof updateBonusRuleSchema>



  export const createBonusRuleCompanySchema = z.object({
    bonusRuleId: z.number().int().min(1),
    companyCode: z.string().min(1)

  })


  export type CreateBonusRuleCompanyInput = z.infer<typeof createBonusRuleCompanySchema>


  export const updateBonusSchema = z.object({
    id: z.number().int().positive(),
    bonusAmount: z.number().min(0)
  })


  export type CalculateLeaveType = {
    bonusType: string,
    bonusStart: Date,
    bonusEnd: Date,
    leaveStart: Date | null,
    leaveEnd?: Date  | null,
  }

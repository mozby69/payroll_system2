import { z } from "zod"


export const BonusTypeEnum = z.enum([
  "QUARTERLY",
  "MIDYEAR",
  "ANNUAL",
  "SPECIAL"
])

export const FormulaTypeEnum = z.enum([
  "BASIC_DIV_2",
  "BASIC_DIV_1"
])
 

export const bonusRuleBaseSchema = z.object({
  code: z.string().min(3).max(20),
  name: z.string().min(3),
  bonusType: BonusTypeEnum,
  eligibleMonth: z.number().int().min(1).max(12),
  minTenureMonths: z.number().int().min(0),
  formulaType: FormulaTypeEnum,
  taxable: z.boolean().default(false)
})

export const bonusRuleFormSchema = bonusRuleBaseSchema.extend({
  bonusType: BonusTypeEnum.nullable(),
  formulaType: FormulaTypeEnum.nullable()
})


export type CreateBonusRuleForm =
  z.infer<typeof bonusRuleFormSchema>


export const updateBonusRuleSchema =
  bonusRuleBaseSchema.partial()

export type UpdateBonusRuleForm =
  z.infer<typeof updateBonusRuleSchema>


export const bonusRuleResponseSchema =
  bonusRuleBaseSchema.extend({
    id: z.number(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
  })


export const bonusRuleListSchema =
  z.array(bonusRuleResponseSchema)

export type BonusRule =
  z.infer<typeof bonusRuleResponseSchema>

export type BonusRuleList =
  z.infer<typeof bonusRuleListSchema>


  export const GenerateBonusSchema = z.object({
    bonusRuleId: z.number().int().min(1, "Bonus rule is required"),

    company: z.string().min(1, "Company is required"),

    // YYYY-MM
    releasePeriod: z
        .string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid YYYY-MM format").min(1),

    // YYYY-MM-DD
    asOfDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").min(1),

    // YYYY-MM-DD
    generateDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Generate date is required").min(1),
     })

  

     export type GenerateBonusInput =
        z.infer<typeof GenerateBonusSchema>



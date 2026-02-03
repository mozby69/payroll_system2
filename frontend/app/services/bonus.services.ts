import { bonusRuleListSchema, CreateBonusRuleCompanyForm, CreateBonusRuleForm, GenerateBonusInput, UpdateBonusRuleForm } from "../schema/bonus.schema";
import { BonusCompanyRule } from "../types/bonusType";
import api from "./axios";


export async function getAllBonusRules() {
    const res = await api.get("/bonus/bonus-rules")
    return bonusRuleListSchema.parse(res.data)
  }

export async function createBonusrules(
    payload : CreateBonusRuleForm
) { 
    return api.post("/bonus/create-bonus-rules", payload);
}

export async function updateBonusRuleServices(
    id: number, 
    payload: UpdateBonusRuleForm
) {
    const res = await api.put(`/bonus/bonus-rules/${id}` , payload)
    return res.data
}


export async function deleteBonusRuleServices(id: number) {
    const res = await api.delete(`/bonus/bonus-rules/${id}`)
    return res.data
}
  





    export async function generateBonus(
        payload: GenerateBonusInput
    ) {
        return api.post("/bonus/generate-bonus", payload)
    }

    export async function getEmployeeBonus() {
        const res = await api.get("/bonus/employee-bonus/")
        return res.data
    }


    export async function createBonusCompanyRulesServices(payload: CreateBonusRuleCompanyForm) {
            return api.post("/bonus/company-rules", payload)
    }

    export async function deleteBonusCompanyBonusServices(id: number) {
        const res = await api.delete(`/bonus/company-rules/${id}`)
        return res.data
    }

    export async function getBonusCompanyRulesServices(
        bonusRuleId: number
      ): Promise<BonusCompanyRule[]> {
        const res = await api.get(
          `/bonus/company-rules/${bonusRuleId}`
        )
        return res.data
      }
      
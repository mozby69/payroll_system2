import { bonusRuleListSchema, CreateBonusRuleCompanyForm, CreateBonusRuleForm, GenerateBonusInput, UpdateBonusRuleForm } from "../schema/bonus.schema";
import { BonusCompanyRule, CompanyBonusRule, CompanyBonusRuleResponse } from "../types/bonusType";
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


      export async function resetBonusService() {
            const res = await api.post("/bonus/reset-bonus")
            return res.data        
      }

      export async function submitBonusService() {
        const res = await api.post("/bonus/submit-bonus")
        return res.data
      }


      export async function getBonusSummaryService() {
            const res = await api.get("/bonus/get-summary")
            return res.data.data
      }

      export async function getEmployeeGeneratedBonusService(
        companyCode?: string,
        id?: number
      ) {
        const res = await api.get("/bonus/employee-bonuses", {
          params: {
            companyCode,
            id
          },
        })
        return res.data
      }


      export async function  approveBonusService(id: number) {
          const res = await api.post(`/bonus/approve/${id}`)
          return res.data
      }

      export async function  rejectBonusService(id: number) {
        const res = await api.post(`/bonus/reject/${id}`)
        return res.data
    }

    export async function  releaseBonusService(id: number) {
      const res = await api.post(`/bonus/release/${id}`)
      return res.data
  }
      

      export async function  updateBonusService(id: number, bonusAmount: number) {
        const res = await api.put(`/bonus/update-bonus/${id}`, {
            bonusAmount
        })
        return res.data        
      }

      export async function exportBonusExcelService(payload: {
        bonusSummaryId: number
        companyCode: string
      }) {
        const res = await api.post("/bonus/export-bonus", payload, {
          responseType: "blob",
        })
      
        return res.data
      }

      export async function getCompanyBonusRules(
        companyCode: string,
        releasePeriod?: string
      ): Promise<CompanyBonusRule[]> {
        const res = await api.get<CompanyBonusRuleResponse>(
          "/bonus/bonus-rules-company",
          {
            params: { companyCode, releasePeriod }
          }
        )
        return res.data.data
      }
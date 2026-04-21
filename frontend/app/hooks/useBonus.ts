import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BonusRule, CreateBonusRuleCompanyForm, CreateBonusRuleForm, GenerateBonusInput, UpdateBonusRuleForm } from "../schema/bonus.schema";
import { approveBonusService, createBonusCompanyRulesServices, createBonusrules, deleteBonusCompanyBonusServices, deleteBonusRuleServices, exportBonusExcelService, generateBonus, getAllBonusRules, getBonusCompanyRulesServices, getBonusSummaryService, getCompanyBonusRules, getEmployeeBonus, getEmployeeGeneratedBonusService, rejectBonusService, releaseBonusService, resetBonusService, submitBonusService, updateBonusRuleServices, updateBonusService } from "../services/bonus.services";
import { BonusCompanyRule, BonusSummaryType, CompanyBonusRule, EmployeeBonus, EmployeeGenerateBonusResponse } from "../types/bonusType";

export function useGetAllBonusRules(){
    return useQuery<BonusRule[]>({
        queryKey: ["bonus-rules"],
        queryFn: getAllBonusRules,
        staleTime: 1000 * 60 * 5
    })
}


    export function useCreateBonusRules(){
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (payload: CreateBonusRuleForm) =>
                createBonusrules(payload),
                onSuccess: () =>{
                    queryClient.invalidateQueries({
                        queryKey: ["bonus-rules"]
                    })
                }
        })
    }

    type UpdateBonusRuleArgs = {
        id: number
        payload: UpdateBonusRuleForm
    }

export function useUpdateBonusRules(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, payload}: UpdateBonusRuleArgs) =>
            updateBonusRuleServices(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["bonus-rules"]
            })
        }
    })
}

export function useDeleteBonusRules(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn:(id: number)=>
            deleteBonusRuleServices(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["bonus-rules"]
            })
        }
    })
}



export function useGetEmployeeBonus(){
    return useQuery<EmployeeBonus[]>({
        queryKey: ["employee-bonus"],
        queryFn: getEmployeeBonus,
        staleTime: 1000 * 60 * 5
    })
}

export function useGenerateBonus(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: GenerateBonusInput) =>
            generateBonus(payload),

            onSuccess: () =>{
                queryClient.invalidateQueries({
                    queryKey: ["generated-bonus"]
                })
            }

    })
}


export function useGetBonusCompanyRules(
    bonusRuleId: number | null
  ) {
    return useQuery<BonusCompanyRule[]>({
      queryKey: ["bonus-company-rules", bonusRuleId],
      queryFn: () => {
        if (!bonusRuleId) return Promise.resolve([])
        return getBonusCompanyRulesServices(bonusRuleId)
      },
      enabled: !!bonusRuleId
    })
  }
  

  export function useDeleteBonusCompanyRUles(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn:(id: number)=>
            deleteBonusCompanyBonusServices(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["bonus-company-rules"]
            })
            queryClient.invalidateQueries({
                queryKey: ["bonus-rules"]
            })
            queryClient.invalidateQueries({
                queryKey: ["bonus-rules-company"]
            })
        }
    })
}


    export function useCreateBonusCompanyRules(){
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (payload: CreateBonusRuleCompanyForm) =>
                createBonusCompanyRulesServices(payload),
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: ["bonus-company-rules"]
                    })
                    queryClient.invalidateQueries({
                        queryKey: ["bonus-rules"]
                    })
                    queryClient.invalidateQueries({
                        queryKey: ["bonus-rules-company"]
                    })
                }
        })
    }


export function useResetBonus(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: resetBonusService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bonus-summary"] })
            queryClient.invalidateQueries({ queryKey: ["generated-bonus"] })
        }
    })
}

export function useSubmitBonus(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: submitBonusService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bonus-summary"] })
            queryClient.invalidateQueries({ queryKey: ["generated-bonus"] })
        }
    })
}


export function useGetBonusSummary(){
    return useQuery<BonusSummaryType[]>({
        queryKey: ["bonus-summary"],
        queryFn: getBonusSummaryService,
        staleTime: 1000 * 60 * 5
    })
}


export function useGetEmployeeGeneratedBonus(
    companyCode?: string,
    selectedGroup?: number,
    id?: number,
  ) {
    console.log("companyCode:", companyCode)
    console.log("selectedGroup:", selectedGroup)
    return useQuery<EmployeeGenerateBonusResponse>({
        
      queryKey: ["generated-bonus", companyCode, id, selectedGroup],
      queryFn: () =>
        getEmployeeGeneratedBonusService(companyCode, id, selectedGroup),
      enabled: !!companyCode && selectedGroup !== undefined,
      staleTime: 1000 * 60 * 5,
    });
  }

  export function useApproveBonus(){
    const quieryClient = useQueryClient();
    return useMutation({
        mutationFn:(id: number) =>
            approveBonusService(id),
        onSuccess: () => {
            quieryClient.invalidateQueries({queryKey: ["bonus-summary"]})
        }
    })
  }

  export function useRejectBonus(){
    const quieryClient = useQueryClient();
    return useMutation({
        mutationFn:(id: number) =>
            rejectBonusService(id),
        onSuccess: () => {
            quieryClient.invalidateQueries({queryKey: ["bonus-summary"]})
        }
    })
  }

  export function useReleaseBonus(){
    const quieryClient = useQueryClient();
    return useMutation({
        mutationFn:(id: number) =>
            releaseBonusService(id),
        onSuccess: () => {
            quieryClient.invalidateQueries({queryKey: ["bonus-summary"]})
        }
    })
  }
  

  export function useUpdateBonus(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id, bonusAmount
        }: {
            id: number,
            bonusAmount: number
        }) => updateBonusService(id, bonusAmount),
        onSuccess:  () => {
            queryClient.invalidateQueries({queryKey: ["generated-bonus"]})
        }
    })
  }

  export function useExportBonusExcel() {
    return useMutation({
      mutationFn: exportBonusExcelService,
    })
  }


  export function useGetCompanyBonusRules(
    companyCode: string,
    releasePeriod?: string
  ) {
    return useQuery<CompanyBonusRule[]>({
      queryKey: ["bonus-rules-company", companyCode, releasePeriod],
      queryFn: () => getCompanyBonusRules(companyCode, releasePeriod),
      enabled: !!companyCode,
      staleTime: 1000 * 60 * 5
    })
  }
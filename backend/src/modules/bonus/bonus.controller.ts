import { Request, Response } from "express"
import { createBonusRuleCompanyServices, createBonusRuleService, deleteBonusRuleCompanyServices, deleteBonusRulesService, generateBonusForAllEmployees, getAllBonusRulesService, getBonusCompanyRuleServices, getBonusSummaryService, getEmployeeBonusService, resetBonusService, submitBonusSerive, updateBonusRuleService } from "./bonus.services"
import { createBonusRuleCompanySchema, createBonusRuleSchema, updateBonusRuleSchema } from "./bonus.schema"
import { json } from "zod";



export async function creataBonusRuleController(
    req: Request,
    res: Response    
) {
    try{
         const data = createBonusRuleSchema.parse(req.body);
         await createBonusRuleService(data)
         res.status(201).json({message: "Bonus rule created"})
    } catch (error: any) {
        console.error(error)
        return res.status(500).json({
          message: error.message ?? "Internal server error"
        })
      }
}


export async function updateBonusRuleController(
    req: Request,
    res: Response    
) {
    try {
      const id = Number(req.params.id)
  
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid rule ID" })
      }
  
      const data = updateBonusRuleSchema.parse(req.body)
  
      await updateBonusRuleService(id, data)
  
      res.status(200).json({ message: "Bonus rule updated successfully" })
    } catch (err: any) {
      if (err.name === "ZodError") {
        return res.status(400).json({ errors: err.errors })
      }
  
      res.status(400).json({ message: err.message })
    }
  }



  export async function getAllBonusRulesController(
    req: Request,
    res: Response,
) {
    try{
        const bonusRules = await getAllBonusRulesService()
        return res.status(200).json(bonusRules)
    }catch(error){
        console.error(error)
        return res.status(500).json({
            message: "Failed to fetvh bonus rules"
        })
    }
  }


  export async function deleteBonusRuleController(
   req: Request,
   res: Response
  ) {
    try{
      const id = Number(req.params.id)
      if(Number.isNaN(id)){
        return res.status(400).json({
          message: "Invalid bonus rule ID"
        })
      }

      await deleteBonusRulesService(id)
      return res.status(200).json({
        message: "Bonus rule deleted successfully"
      })

    }catch(error: any){
      if(error.message === "BONUS_RULE_NOT_FOUND"){
        return res.status(409).json({
          message: "Invalid bonus rule ID"
        })
      }
      return res.status(500).json({
        message: "Failed to delete bonus rule"
      })
    }
    
  }

  // Company Rules 

  export async function createBonusRuleCompanyController(
    req: Request,
    res: Response
  ) {
    try{
      const data = createBonusRuleCompanySchema.parse(req.body)
      await createBonusRuleCompanyServices(data)
      res.status(200).json({message: "Company bonus rule successfully added"})
    } catch(error: any){
      if(error.message === "BONUS_RULE_NOT_FOUND"){
        return res.status(409).json({
          message: "Invalid bonus rule ID"
        })
      }
      if(error.message === "COMPANY_NOT_FOUND"){
        return res.status(409).json({
          message: "Invalid company code"
        })
      }

      if(error.message === "RULES_DUPLICATION"){
        return res.status(409).json({
          message: "Bonus rules already added to this company"
        })
      }
      return res.status(500).json({
        message: "Failed to add bonus rule"
      })
    }
  }


 export async function getBonusRuleCompanyController(
  req: Request,
  res: Response
 ) {
  try{
    const bonusRuleId = Number(req.params.bonusRuleId)
    if(Number.isNaN(bonusRuleId)){
      return res.status(400).json({
        message: "Invalid bonus rule ID"
      })
    }
    const bonusRules = await getBonusCompanyRuleServices(bonusRuleId)
    return res.status(200).json(bonusRules)
}catch(error: any){
    if(error.message === "BONUS_RULE_NOT_FOUND"){
      return res.status(409).json({
        message: "Invalid bonus rule ID"
      })
    }
      return res.status(500).json({
          message: "Failed to fetch compnay bonus rules"
      })
}

}

  export async function deleteBonusCompanyRuleController(
    req: Request,
    res: Response
  ) {
      try{
            const id = Number(req.params.id)
            if(Number.isNaN(id)){
              return res.status(400).json({
                message: "Invalid bonus rule ID"
              })
            }
            await deleteBonusRuleCompanyServices(id)
            return res.status(200).json({
              message: "Bonus rules successfully deleted"
            })
      }catch(error: any){
        if(error.message === "BONUS_RULE_NOT_FOUND"){
          return res.status(409).json({
            message: "Invalid bonus rule ID"
          })
        }
        return res.status(500).json({
          message: "Failed to delete bonus rule"
        })
      }
  }
  

//Gerate Bonus Controller

  export async function generateBonusController(
    req: Request,
    res: Response
  ) {
    try {
      const { bonusRuleId, releasePeriod, asOfDate, generateDate } = req.body

      if (!bonusRuleId || !releasePeriod || !asOfDate) {
        return res.status(400).json({
          message: "Missing required fields"
        })
      }
 

     const bonus = await generateBonusForAllEmployees({
        bonusRuleId: Number(bonusRuleId),
        releasePeriod,
        asOfDate: new Date(asOfDate),
        generateDate: new Date(generateDate)
      })
  
      return res.status(200).json({
        message: "Bonuses generated successfully 1",
        data: bonus
      })
    } catch (err: any) {
      switch (err?.code) {
        case "INVALID_BONUS_AMOUNT":
          return res.status(400).json(err)
    
        case "PENDING_BONUS":
          return res.status(409).json(err)
    
        default:
          return res.status(500).json({
            message: "Internal server error"
          })
      }
    }
    
  }
  

  export async function getEmployeeBonusController(
    req: Request,
    res: Response,
  ) {
      try{
        const employeeBonus = await getEmployeeBonusService()
        return res.status(200).json(employeeBonus)

      }catch(error){
        console.error(error)
        return res.status(500).json({
            message: "Failed to fetch employee bonuses"
        })
      }
  }

// bonus.controller.ts
export async function resetBonusController(
  req: Request,
   res: Response) {
  try {
    const result = await resetBonusService()
    return res.status(200).json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: "Failed to reset bonus"
    })
  }
}


export async function submitBonusController(
  req: Request,
   res: Response) {
  try {
    const result = await submitBonusSerive()
    return res.status(200).json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: "Failed to submit bonus"
    })
  }
}

export async function getBonusSummaryController(
    req: Request,
    res: Response
) {
  try{
    const result = await getBonusSummaryService()
    return res.status(200).json(result)
    } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: "Failed to fetch bonus summary"
    })
  }
  
}





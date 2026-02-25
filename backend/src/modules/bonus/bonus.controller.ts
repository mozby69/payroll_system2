import { Request, Response } from "express"
import { approveBonusService, createBonusRuleCompanyServices, createBonusRuleService, deleteBonusRuleCompanyServices, deleteBonusRulesService, generateBonusForAllEmployees, getAllBonusRulesService, getBonusCompanyRuleServices, getBonusSummaryService, getEmployeeBonusService, getEmployeeBonusServiceBySummaryIdService, getEmployeesByBonusSummarySerive, rejectBonusService, releaseBonusService, resetBonusService, submitBonusSerive, updateBonusRuleService, updateBonusService } from "./bonus.services"
import { createBonusRuleCompanySchema, createBonusRuleSchema, updateBonusRuleSchema, updateBonusSchema } from "./bonus.schema"
import z, { json } from "zod";



export async function creataBonusRuleController(
    req: Request,
    res: Response    
) {
    try{
         const data = createBonusRuleSchema.parse(req.body);
         const created = await createBonusRuleService(data)
         res.status(201).json({message: "Bonus rule created", initialData: {id: created.id, name: created.name}})
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
        generateDate: new Date(generateDate),
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

      case "NO_COMPANY_ASSIGNED":
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


  export async function getEmployeeBonusBySummaryIdController(
    req: Request,
    res: Response
  ) {
    try{
        const bonusSummaryId = Number(req.params.id);
        if(Number.isNaN(bonusSummaryId)){
          return res.status(400).json({
            message: "Invalid bonus rule ID"
          })
        }

        const employeeBonus = await getEmployeeBonusServiceBySummaryIdService(bonusSummaryId)
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


export async function approveBonusController(
  req: Request,
  res: Response
) {
  try {
    // Validate and parse ID
    const bonusSummaryId = Number(req.params.id)

    if (isNaN(bonusSummaryId)) {
      return res.status(400).json({
        message: "Invalid bonus summary ID"
      })
    }

    // Get authenticated user
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      })
    }

    const approvedBy = req.user.id

    // Call service
    const result = await approveBonusService(
      bonusSummaryId,
      approvedBy
    )

    // Success response
    return res.status(200).json(result)

  } catch (error: any) {

    // Controlled business errors
    return res.status(400).json({
      message: error.message || "Failed to approve bonus"
    })
  }
}

export async function rejectBonusController(
  req: Request,
  res: Response
) {
  try{
    const bonusSummaryId = Number(req.params.id)

    if(isNaN(bonusSummaryId)){
      return res.status(400),json({
        message: "Invali bonus summary ID"
      })
    }
    if(!req.user){
      return res.status(401).json({
        message: "Unauthorized"
      })
    }

    const releasedBy = req.user.id
    const result = await rejectBonusService(
      bonusSummaryId,
      releasedBy
    )

    return res.status(200).json(result)

  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to release bonus"
    })
  }
  
}



export async function releaseBonusController(
  req: Request,
  res: Response
) {
  try {
    // Validate ID
    const bonusSummaryId = Number(req.params.id)

    if (isNaN(bonusSummaryId)) {
      return res.status(400).json({
        message: "Invalid bonus summary ID"
      })
    }

    // Ensure authenticated user exists
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      })
    }

    const releasedBy = req.user.id

    // Call service
    const result = await releaseBonusService(
      bonusSummaryId,
      releasedBy
    )

    //  Success response
    return res.status(200).json(result)

  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to release bonus"
    })
  }
}


export async function getEmployeesByBonusSummaryController(
  req: Request,
  res: Response
) {
  try {
    const companyCode = req.query.companyCode as string | undefined
    const id = req.query.id
      ? Number(req.query.id)
      : undefined

    const data =
      await getEmployeesByBonusSummarySerive(companyCode, id)

    return res.status(200).json({
      success: true,
      data,
    })

  } catch (error: any) {
    return res.status(200).json({
      success: false,
      data: {
        summary: null,
        companies: [],
        employees: [],
      },
      message: error.message,
    })
  }
}


export async function updateBonusController(
  req: Request,
  res: Response
) {
  try {
    // Validate request body
    const validated = updateBonusSchema.parse({
      id: Number(req.params.id),
      bonusAmount: Number(req.body.bonusAmount)
    })

    // Ensure authenticated user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      })
    }

    const result = await updateBonusService(
      validated.id,
      validated.bonusAmount,
      req.user.id
    )
    return res.status(200).json({
      success: true,
      message: "Bonus updated successfully",
      data: result
    })

  } catch (error: any) {

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues
      })
    }
    if (error.message === "Bonus not found") {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }
    console.error("Update Bonus Error:", error)

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}








import { Request, Response } from "express"
import { approveBonusService, checkPayrollService, createBonusRuleCompanyServices, createBonusRuleService, deleteBonusRuleCompanyServices, deleteBonusRulesService, exportBonusExcelServices, generateBonusForAllEmployees, generateMultipleBonuses, getAllBonusRulesService, getBonusCompanyRuleServices, getBonusSummaryService, getCompanyBonusRulesService, getEmployeeBonusService, getEmployeeBonusServiceBySummaryIdService,  getEmployeesByBonusSummaryService, getEmployeesFCHBonusSummaryService, rejectBonusService, releaseBonusService, resetBonusService, resolveBonusRuleIds, submitBonusSerive, updateBonusRuleService, updateBonusService } from "./bonus.services"
import { createBonusRuleCompanySchema, createBonusRuleSchema, updateBonusRuleSchema, updateBonusSchema } from "./bonus.schema"
import z, { json } from "zod";
import { generateBatchId } from "./bonus.utils";
import { prisma } from "../../config/prismaClient";
import ExcelJS from "exceljs"



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

  // export async function generateBonusController(
  //   req: Request,
  //   res: Response
  // ) {
  //   try {
  //     const { bonusRuleId, releasePeriod, asOfDate, generateDate } = req.body

  //     if (!bonusRuleId || !releasePeriod || !asOfDate) {
  //       return res.status(400).json({
  //         message: "Missing required fields"
  //       })
  //     }
 

  //    const bonus = await generateBonusForAllEmployees({
  //       bonusRuleId: Number(bonusRuleId),
  //       releasePeriod,
  //       asOfDate: new Date(asOfDate),
  //       generateDate: new Date(generateDate),
  //     })
  
  //     return res.status(200).json({
  //       message: "Bonuses generated successfully 1",
  //       data: bonus
  //     })
  //   } catch (err: any) {
  //     switch (err?.code) {
  //       case "INVALID_BONUS_AMOUNT":
  //         return res.status(400).json(err)
    
  //       case "PENDING_BONUS":
  //         return res.status(409).json(err)

  //     case "NO_COMPANY_ASSIGNED":
  //           return res.status(409).json(err)
    
  //       default:
  //         return res.status(500).json({
  //           message: "Internal server error"
  //         })
  //     }
  //   }
    
  // }


  export async function generateBonusController(
    req: Request,
    res: Response
  ) {
    try {

      let { bonusRuleIds, releasePeriod, asOfDate, generateDate, companyCode } = req.body
  
      if (!releasePeriod || !asOfDate || !companyCode) {
        return res.status(400).json({
          message: "Missing required fields1"
        })
      }
  
      const asOf = new Date(asOfDate)
      const genDate = generateDate ? new Date(generateDate) : new Date()
  
 

        // ✅ FIX: reassign instead of redeclare
    bonusRuleIds = await resolveBonusRuleIds({
      asOfDate: asOf,
      providedRuleIds: bonusRuleIds
    })
  
      // ✅ CREATE BATCH ID
      const batchId = generateBatchId(releasePeriod)
  
      const result = await generateMultipleBonuses({
        bonusRuleIds,
        releasePeriod,
        asOfDate: asOf,
        generateDate: genDate,
        companyCode,
        batchId
      })
  
      return res.status(200).json({
        message: "Bonuses generated successfully",
        batchId,
        data: result
      })
  
    }catch (err: any) {
      console.error("ERROR:", err) // ✅ ADD THIS
    
      return res.status(500).json({
        message: err?.message || "Internal server error",
        error: err // optional (for debugging)
      })
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

    const user = req.user
    const companyCode = user?.company_id
    if(!companyCode){
      return res.status(400).json({
        message: "User has no company assigned"
      })
    }
    const result = await resetBonusService(companyCode)
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
    const user = req.user
    const companyCode = user?.company_id
    if(!companyCode){
      return res.status(400).json({
        message: "User has no company assigned"
      })
    }
    const result = await submitBonusSerive(companyCode)
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
  try {
    const user = req.user
    const companyCode = user?.company_id
    const permissions = user?.permissions || []



    const hasApproveAccess =
      permissions.includes("BONUS_APPROVE") ||
      permissions.includes("BONUS_RELEASE")

    let result

    if (hasApproveAccess) {
      // ✅ ALL data
      result = await getBonusSummaryService()
    } else {
      // ❌ must have company
      if (!companyCode) {
        return res.status(400).json({
          message: "User has no company assigned"
        })
      }

      // ✅ filtered
      result = await getBonusSummaryService(companyCode)
    }


    return res.status(200).json({
      success: true,
      data: result
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
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

      const groupId = req.query.groupId
        ? Number(req.query.groupId)
        : undefined;

        console.log("dawd", groupId)

        let data;

        if (companyCode === "FCH") {
          data = await getEmployeesFCHBonusSummaryService(
            companyCode,
            id,
            groupId
          ); 
        } else {
          data = await getEmployeesByBonusSummaryService(
            companyCode,
            id
          );
        }

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


export async function checkPayroll(req: Request, res: Response) {
      const data = await checkPayrollService();
      return res.status(200).json(data)
}





export const exportBonusExcelController = async (req: Request, res: Response) => {
  try {
    const { bonusSummaryId, companyCode } = req.body
    const { workbook, fileName } =
      await exportBonusExcelServices({
        bonusSummaryId,
        companyCode,
      })

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    )

    await workbook.xlsx.write(res)
    res.end()

  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Failed to export Excel",
    })
  }
}


export async function getCompanyBonusRulesController(
  req: Request,
  res: Response
) {
  try {
    const { companyCode, releasePeriod } = req.query

    if (!companyCode || typeof companyCode !== "string") {
      return res.status(400).json({
        message: "companyCode is required"
      })
    }

    const data = await getCompanyBonusRulesService(
      companyCode,
      typeof releasePeriod === "string" ? releasePeriod : undefined
    )

    return res.status(200).json({
      message: "Bonus rules fetched successfully",
      data
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: "Failed to fetch bonus rules"
    })
  }
}





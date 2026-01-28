import { Request, Response } from "express"
import { createBonusRuleService, deleteBonusRulesService, generateBonusForAllEmployees, getAllBonusRulesService, getEmployeeBonusService, updateBonusRuleService } from "./bonus.services"
import { createBonusRuleSchema, updateBonusRuleSchema } from "./bonus.schema"



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

//Gerate Bonus Controller

  export async function generateBonusController(
    req: Request,
    res: Response
  ) {
    try {
      const { bonusRuleId, releasePeriod, asOfDate } = req.body
      // 1. Basic validation (controller-level only)
      if (!bonusRuleId || !releasePeriod || !asOfDate) {
        return res.status(400).json({
          message: "Missing required fields"
        })
      }
      // 2. Call service
      await generateBonusForAllEmployees({
        bonusRuleId: Number(bonusRuleId),
        releasePeriod,
        asOfDate: new Date(asOfDate)
      })
  
      // 3. Response
      return res.status(200).json({
        message: "Bonuses generated successfully"
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({
        message: error.message ?? "Internal server error"
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




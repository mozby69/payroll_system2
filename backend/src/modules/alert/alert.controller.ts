import { Request, Response } from "express";
import { createAlertSchema } from "./alert.schema";
import { createAlertConfigurationService, getAlertConfigurationService } from "./alert.services";

export async function createAlertConfigurationController(
  req: Request,
  res: Response
) {
  try {
    const parsed = createAlertSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const alertConfig = await createAlertConfigurationService(parsed.data);

    return res.status(200).json({
      success: true,
      message: "Alert configuration saved successfully",
      data: alertConfig,
    });
  } catch (error) {
    console.error("Create alert configuration error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


export async function getAlertConfigurationController(
   req: Request,
   res: Response
 ) {
   try {
     const alert = await getAlertConfigurationService();
 
     return res.status(200).json({
       success: true,
       data: alert,
     });
   } catch (error) {
     console.error(error);
 
     return res.status(500).json({
       success: false,
       message: "Failed to get alert configuration",
     });
   }
 }
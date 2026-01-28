import { archiveComputedPayroll, displayCompletePayroll } from "./payroll_archive.service";
import { Request,Response } from "express";

export const archivePayrollController = async (req: Request, res: Response) => {
  try {
    const { cycle, payrollPeriod } = req.body as {
      cycle?: string;
      payrollPeriod?: string;
    };

    if (!cycle || !payrollPeriod) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const result = await archiveComputedPayroll({ cycle, payrollPeriod });

    if (!result.archived) {
      return res.status(409).json({
        status: "DUPLICATE",
        message: "Payroll already archived for this PayCode",
      });
    }

    return res.status(200).json({
      status: "SUCCESS",
      message: "Payroll archived successfully",
    });
  } catch (error) {
    console.error("Payroll archive failed:", error);

    return res.status(500).json({
      status: "ERROR",
      message: "Failed to archive payroll",
    });
  }
};





export const displayCompletePayrollController = async (req: Request, res: Response) => {
  try{
  

    const data = await displayCompletePayroll();

    return res.status(200).json({ status: "SUCCESS",data });
  }
  catch(error){
    res.status(500).json({message:`SERVER ERROR: ${error}`})
  }
}
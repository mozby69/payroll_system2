import { archiveComputedPayroll } from "./payroll_archive.service";
import { Request,Response } from "express";

export const archivePayrollController = async (req: Request,res: Response) => {
    try {
      const { cycle, payrollPeriod } = req.body as { cycle?: string; payrollPeriod?: string};
  
      if (!cycle || !payrollPeriod) {
        return res.status(400).json({
          message: "Invalid payload",
        });
      }
  
      await archiveComputedPayroll({ cycle, payrollPeriod });
  
      return res.status(200).json({
        message: "Payroll archived successfully",
      });
    } catch (error) {
      console.error("Payroll archive failed:", error);
  
      return res.status(500).json({
        message: "Failed to archive payroll",
      });
    }
  };




import { fetchEmployeeVariance, fetchVariance } from "./variance.service";
import { Request, Response } from "express";




export async function fetchVarianceController(req: Request, res: Response) {
    try {

      const result = await fetchVariance();
      const res2 = await fetchEmployeeVariance();
      return res.json({ success: true, current_period: result, employee:res2 });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to save payroll" });
    }
  }
  
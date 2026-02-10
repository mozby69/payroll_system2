import { fetchVariance } from "./variance.service";
import { Request, Response } from "express";




export async function fetchVarianceController(req: Request, res: Response) {
    try {
        const cycle = req.query.cycle as "10-25-Cycle" | "15-30-Cycle" | undefined;
      const result = await fetchVariance();
      return res.json({ success: true, res: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to save payroll" });
    }
  }
  
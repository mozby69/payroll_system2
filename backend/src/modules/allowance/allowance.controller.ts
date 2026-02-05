import {  computeAllowanceForMonth, fetchAllowanceWithAbsent, fetchArchiveAllowance, saveAllowanceArchive } from "./allowance.service";
import { Request,Response } from "express";


export const fetchAllowanceController = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const month = typeof req.query.month === "string" ? req.query.month : "";

    // 🔴 Validate month format: YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        message: "Month is required and must be in YYYY-MM format",
      });
    }

    const result = await fetchAllowanceWithAbsent({
      page,
      limit,
      search,
      selectedMonth: month,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("FETCH ALLOWANCE ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch allowance data",
    });
  }
};





export const saveAllowanceController = async (req: Request, res: Response) => {
  try {
    const selectedMonth = req.body?.selectedMonth;

    if (!/^\d{4}-\d{2}$/.test(selectedMonth)) {
      return res.status(400).json({
        message: "selectedMonth is required and must be YYYY-MM",
      });
    }

    await saveAllowanceArchive(selectedMonth);

    return res.status(200).json({
      message: "Allowance saved successfully",
    });
  } 
  catch (error: any) {
    if (error.message === "ALLOWANCE_ALREADY_SAVED") {
      return res.status(409).json({
        message: "Allowance for this month has already been saved.",
      });
    }

    console.error("SAVE ALLOWANCE ERROR:", error);
    return res.status(500).json({
      message: "Failed to save allowance",
    });
  }
};



export const fetchAllowanceSummaryController = async (req: Request, res: Response) => {
  const selectedMonth = req.query.month as string;

  if (!/^\d{4}-\d{2}$/.test(selectedMonth)) {
    return res.status(400).json({ message: "Invalid month" });
  }

  const { summary } = await computeAllowanceForMonth(selectedMonth);

  res.json(summary);
};



export const fetchArchiveAllowanceController = async (req: Request, res: Response) => {
  try{
  
    const data = await fetchArchiveAllowance();

    return res.status(200).json(data);
  }
  catch(error){
    res.status(500).json({message:`SERVER ERROR: ${error}`})
  }
}

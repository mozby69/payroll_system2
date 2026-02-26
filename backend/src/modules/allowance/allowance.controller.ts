import {  computeAllowanceForMonth, displayAllowanceList, fetchAllowanceWithAbsent, getArchiveAllowanceByCompanyBranch, getArchiveAllowanceByMonth, getBranchesByCompany, saveAllowanceArchive, ViewAllList } from "./allowance.service";
import { Request,Response } from "express";


export const fetchAllowanceController = async (req: Request, res: Response) => {
  
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const month = typeof req.query.month === "string" ? req.query.month : "";
    
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
  } 
    catch (error) {
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
  } catch (error: any) {
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




export const fetchAllowanceSummary2Controller = async (req: Request, res: Response) => {
  const selectedMonth = req.query.month as string;

  if (!/^\d{4}-\d{2}$/.test(selectedMonth)) {
    return res.status(400).json({ message: "Invalid month" });
  }

  const { summary } = await computeAllowanceForMonth(selectedMonth);

  res.json(summary);
};



export const fetchAllowanceSummaryController = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    const result = await displayAllowanceList({ page,limit,search});

    return res.status(200).json(result);
  } catch (error) {
    console.error("FETCH ALLOWANCE ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch allowance data",
    });
  }
};




export async function fetchArchiveAllowanceByMonthController(req: Request, res: Response) {
  const { selectedMonth } = req.params;

  if (!selectedMonth) {
    return res.status(400).json({ message: 'selectedMonth is required' });
  }

  const data = await getArchiveAllowanceByMonth(selectedMonth);

  return res.json({ data });
}






export async function getBranchesByCompanyController(req: Request,res: Response) {
  try {
    const { companyCode } = req.query;

    if (!companyCode || typeof companyCode !== "string") {
      return res.status(400).json({ message: "companyCode is required" });
    }

    const result = await getBranchesByCompany(companyCode);

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch branches" });
  }
}


export const allowancePrintController = async (req: Request,res: Response) => {
  try {
    const { month, company, branch } = req.query;

    if (!month || !company || !branch) {
      return res.status(400).send("Missing parameters");
    }

    // Build frontend route
    const frontendPath = `/print?month=${month}&company=${company}&branch=${branch}`;

    // Redirect to reusable PDF generator
    return res.redirect(
      `/api/general/print?path=${encodeURIComponent(frontendPath)}`
    );

  } catch (error) {
    console.error(error);
    res.status(500).send("PDF generation failed");
  }
};


export const fetchAllowancePrintDataController = async (req: Request,res: Response) => {
  try {
    const { month, company, branch } = req.query;

    if (!month || !company || !branch) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const result = await getArchiveAllowanceByCompanyBranch({
      selectedMonth: month as string,
      company: company as string,
      branch: branch as string,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch print data",
    });
  }
};




export const fetchViewAllListController = async (req: Request, res: Response) => {
  const selectedMonth = req.query.month as string;

  if (!/^\d{4}-\d{2}$/.test(selectedMonth)) {
    return res.status(400).json({ message: "Invalid month" });
  }

  const data = await ViewAllList(selectedMonth);

  res.json(data);
};


import { getBranch } from "../general/general.services";
import {  computeAllowanceForMonth, displayAllowanceList, displayEmergencyAllowance, exportAllowanceExcel, fetchAllowanceWithAbsent, getArchiveAllowanceByCompanyBranch, getArchiveAllowanceByMonth, getBranchesByCompany, getTotalPerCompany, getVarianceEmployees, getVarianceForAllowance, saveAllowanceArchive, sendBulkAllowanceService, updateAbsentOverride, updateAllowanceBranch, updateEmergencyAllowance, ViewAllList } from "./allowance.service";
import { Request,Response } from "express";
import { SendBulkAllowanceBody } from "./allowance.types";


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




export async function fetchArchiveAllowanceByMonthController(req: Request,res: Response) {
  try {
    const selectedMonth =
      typeof req.params.selectedMonth === "string"
        ? req.params.selectedMonth.trim()
        : "";

    if (!selectedMonth) {
      return res.status(400).json({
        message: "selectedMonth is required",
      });
    }

    const data =
      await getArchiveAllowanceByMonth(
        selectedMonth
      );

    if (!data) {
      return res.status(404).json({
        message: "Archived allowance not found",
      });
    }

    return res.status(200).json({
      data,
    });
  } catch (error) {
    console.error(
      "Failed to fetch archived allowance:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch archived allowance",
    });
  }
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
    const { month, company, branch, empId } = req.query;

    if (
      typeof month !== "string" ||
      typeof company !== "string"
    ) {
      return res.status(400).json({
        message:
          "Month and company are required",
      });
    }

    const selectedBranch =
      typeof branch === "string" &&
      branch.trim()
        ? branch.trim()
        : undefined;

    const selectedEmployee =
      typeof empId === "string" &&
      empId.trim()
        ? empId.trim()
        : undefined;

    const result = await getArchiveAllowanceByCompanyBranch({
        selectedMonth: month,
        company,
        branch: selectedBranch,
        empId: selectedEmployee,
      });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
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
  const ress = "sdfs";

  res.json(data);
};


export async function updateAllowanceBranchController(req:Request, res:Response) {
  const { EmpCode, selectedMonth, branchCode } = req.body;

  await updateAllowanceBranch({
    EmpCode,
    selectedMonth,
    branchCode,
  });

  res.json({ success: true });
}




export async function updateAbsentOverrideController(req: Request, res: Response) {
  const { EmpCode, selectedMonth, absent_hours, exclude } = req.body;

  await updateAbsentOverride({
    EmpCode,
    selectedMonth,
    absent_hours: Number(absent_hours),
    exclude
  });

  res.json({ success: true });
}



export async function getTotalPerCompanyController(req: Request, res: Response) {
  try {
    const selectedMonth = req.query.month as string;

    if (!selectedMonth) {
      return res.status(400).json({ message: "Month is required" });
    }

    const data = await getTotalPerCompany(selectedMonth);

    return res.status(200).json(data);
  } catch (error) {
    console.error(`error ocurred in controller ${error}`);
    return res.status(500).json({ message: "error occured" });
  }
}




export async function sendBulkAllowanceServiceController(req: Request<Record<string, never>, unknown, SendBulkAllowanceBody>,res: Response) {
  try {
    const { month, company, branch } = req.body;

    if (
      typeof month !== "string" ||
      !month.trim()
    ) {
      return res.status(400).json({
        message: "Month is required",
      });
    }

    if (
      typeof company !== "string" ||
      !company.trim()
    ) {
      return res.status(400).json({
        message: "Company is required",
      });
    }

    const selectedBranch =
      typeof branch === "string" &&
      branch.trim()
        ? branch.trim()
        : undefined;

    const data =
      await sendBulkAllowanceService({
        month: month.trim(),
        company: company.trim(),
        branch: selectedBranch,
      });

    return res.status(200).json(data);
  } catch (error: unknown) {
    console.error(
      "Error occurred while sending allowance emails:",
      error
    );

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to send allowance emails",
    });
  }
}






  export const updateEmergencyAllowanceController = async (req: Request, res: Response) => {
    try{
      const allowance_id = Number(req.params.allowance_id);
      const { is_emergency,emergency_allowance_amount } = req.body;

      const updated = await updateEmergencyAllowance(
        allowance_id,
        is_emergency,
        emergency_allowance_amount
      );

      return res.status(200).json(updated);
    }
    catch(error){
      return res.status(500).json({ message: `SERVER ERROR ${error}`})
    }
}

export const displayEmergencyAllowanceController = async (req:Request, res:Response) => {
  try{
    const data = await displayEmergencyAllowance();
    return res.status(200).json(data);
  }

  catch(error){
    return res.status(500).json({ message: `SERVER ERROR ${error}`})
  }
}


export const getVarianceEmployeesController = async (req:Request, res:Response) => {
  try{
     const selectedMonth = req.query.month as string;

    if (!selectedMonth) {
      return res.status(400).json({ message: "Month is required" });
    }
    
    const data = await getVarianceEmployees(selectedMonth);
    return res.status(200).json(data);
  }

  catch(error){
    return res.status(500).json({ message: `SERVER ERROR ${error}`})
  }
}





export async function exportAllowanceExcelController(req: Request,res: Response) {
  try {
    const selectedMonth = String(req.query.selectedMonth ?? "");

    if (!/^\d{4}-\d{2}$/.test(selectedMonth)) {
      return res.status(400).json({
        message:
          "selectedMonth must use YYYY-MM format",
      });
    }

    const fileBuffer = await exportAllowanceExcel(selectedMonth);

    const filename = `cash-assistance-${selectedMonth}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    res.setHeader(
      "Content-Length",
      fileBuffer.length.toString()
    );

    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error(`error occued ${error}`)
    throw error;
  }
}
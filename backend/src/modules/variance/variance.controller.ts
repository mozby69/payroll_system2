
import { Request, Response } from "express";
import { CompleteVariance, displayVarianceArchive, FetchEmployeeVariance, fetchVariance, getVarianceArchivePerCompany, saveFinalVariance, saveVarianceOverride } from "./variance.service";
import { PayrollCycle, SaveVarianceOverrideParams } from "./variance.types";



export async function fetchVarianceController(req: Request, res: Response) {
  try {
    const company_id = req.query.company_id as string | undefined;
    const cycle = req.query.cycle as "10-25-Cycle" | "15-30-Cycle" | undefined;

    if (!cycle) {
      return res.status(400).json({ message: "cycle is required" });
    }

    if (!company_id) {
      return res.status(400).json({
        message: "company_id is required",
      });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.roles];

    const userAcc = roles[0];

    const data = await fetchVariance(company_id, cycle, userAcc);
    return res.status(200).json({ data });

  } catch (error) {
    console.error(`error occurred ${error}`);
    return res.status(500).json({
      message: "Failed to fetch variance",
    });
  }
}





export async function FetchEmployeeVarianceController(req: Request, res: Response) {
  try {
    const company_id = req.query.company_id as string | undefined;
    const cycle = req.query.cycle as "10-25-Cycle" | "15-30-Cycle" | undefined;

    if (!cycle) {
      return res.status(400).json({ message: "cycle is required" });
    }

    if (!company_id) {
      return res.status(400).json({
        message: "company_id is required",
      });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.roles];

    const userAcc = roles[0];

    const data = await FetchEmployeeVariance(company_id, cycle, userAcc);
    return res.status(200).json({ data });
  }
  catch (error) {
    console.error(`error occured ${error}`);
    return res.status(500).json({ message: `error occured ${error}` })
  }
}






export async function CompleteVarianceController(req: Request, res: Response) {
  try {
    const company_id = req.query.company_id as string | undefined;
    const cycle = req.query.cycle as "10-25-Cycle" | "15-30-Cycle" | undefined;

    if (!cycle) {
      return res.status(400).json({ message: "cycle is required" });
    }

    if (!company_id) {
      return res.status(400).json({
        message: "company_id is required",
      });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.roles];

    const userAcc = roles[0];

    const data = await CompleteVariance(company_id, cycle, userAcc);
    return res.status(200).json(data);
  }
  catch (error) {
    console.error(`error occured ${error}`);
    return res.status(500).json({ message: `error occured ${error}` })
  }
}



export async function saveVarianceOverrideController(req: Request, res: Response) {
  try {
    const {
      EmpCode,
      PayCode,
      company_id,
      cycle,
      category,
    } = req.body;

    if (
      typeof EmpCode !== "string" ||
      typeof PayCode !== "string" ||
      typeof company_id !== "string" ||
      typeof cycle !== "string" ||
      typeof category !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid request.",
      });
    }

    const data = await saveVarianceOverride({
      EmpCode,
      PayCode,
      company_id,
      cycle,
      category,
    });

    return res.status(200).json({
      message: "Category updated.",
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Unable to update category.",
    });
  }
}





export async function saveFinalVarianceController(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const company_id =
      typeof req.query.company_id === "string"
        ? req.query.company_id.trim()
        : "";

    const paycode =
      typeof req.query.paycode === "string"
        ? req.query.paycode.trim()
        : "";

    const cycle =
      typeof req.query.cycle === "string"
        ? req.query.cycle.trim()
        : "";

    if (!company_id) {
      return res.status(400).json({
        message: "company_id is required.",
      });
    }

    if (!paycode) {
      return res.status(400).json({
        message: "paycode is required.",
      });
    }

    if (
      cycle !== "10-25-Cycle" &&
      cycle !== "15-30-Cycle"
    ) {
      return res.status(400).json({
        message: "Invalid payroll cycle.",
      });
    }

    const roles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.roles];

    const userAcc = roles[0];

    if (!userAcc) {
      return res.status(403).json({
        message: "User role was not found.",
      });
    }

    const data = await saveFinalVariance(
      company_id,
      cycle as PayrollCycle,
      userAcc,
      paycode
    );

    return res.status(200).json({
      message: "Variance saved successfully.",
      data,
    });
  } catch (error) {
    console.error(
      "Error in saveFinalVarianceController:",
      error
    );

    return res.status(500).json({
      message: "Unable to save final variance.",
    });
  }
}







  export const displayVarianceArchiveController = async (req: Request, res: Response) => {
    try{
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
      const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
  
      const data = await displayVarianceArchive({page,limit,search});
  
      return res.status(200).json(data);
    }
    catch(error){
      res.status(500).json({message:`SERVER ERROR: ${error}`})
    }
  }



  export async function getVarianceArchivePerCompanyController(req: Request,res: Response) {
  try {
    const mainArchiveId = req.params.mainArchiveId?.trim();

    if (!mainArchiveId) {
      return res.status(400).json({
        message: "Main archive ID is required",
      });
    }

    const data = await getVarianceArchivePerCompany(mainArchiveId);

    return res.status(200).json(data);
  } catch (error) {
    console.error("getVarianceArchivePerCompanyController:", error);

    if (
      error instanceof Error &&
      error.message === "Variance archive not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to retrieve variance archive",
    });
  }
}
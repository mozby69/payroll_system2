import { Request, Response } from "express";
import { getFilteredMainDisburse, saveEmployeeSetup,approveDisburse, getMainDisburseDetails } from "./disburse.services";

export const saveEmployeeSetupController = async (
  req: Request,
  res: Response
) => {
  try {
    const { employees } = req.body;

    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({
        message: "employees array is required",
      });
    }

    await saveEmployeeSetup(
      employees.map((emp: any) => ({
        empCode: emp.empCode,
        Disbursing: Boolean(emp.Disbursing),
        WithAtm: Boolean(emp.WithAtm),
        Taxable: Boolean(emp.Taxable),
      }))
    );

    return res.json({
      message: "Employee setup updated successfully",
    });
  } catch (error) {
    console.error("Save Employee Setup Error:", error);
    return res.status(500).json({
      message: "Failed to update employee setup",
    });
  }
};


export const getMainDisburseController = async (
  req: Request,
  res: Response
) => {
  try {
    const { payrollPeriod, status, page, limit } = req.query;

    const result = await getFilteredMainDisburse({
      payrollPeriod:
        typeof payrollPeriod === "string" ? payrollPeriod : undefined,

      status:
        typeof status === "string"
          ? (status as "AWAITING" | "APPROVED" | "REJECTED")
          : undefined,

      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Main Disburse Error:", error);

    return res.status(500).json({
      message: "Failed to fetch disbursement records",
    });
  }
};

export const approveDisburseController = async ( req:Request, res: Response) => {
  try{
    const { id } =  req.params;

   if (!id) {
      return res.status(400).json({
        message: "Disburse ID is required",
      });
    }

    const result = await approveDisburse(
      Number(id)
    );

    return res.status(200).json({
      message: "Disbursement approved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Approve Disburse Error:", error);
    return res.status(500).json({
      message: "Failed to approve disbursement",
    });
  }
}

export const getMainDisburseDetailsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const data = await getMainDisburseDetails(
      Number(id)
    );

    return res.status(200).json(data);
  } catch (error) {
    console.error("Disburse Details Error:", error);
    return res.status(500).json({
      message: "Failed to fetch disbursement details",
    });
  }
};
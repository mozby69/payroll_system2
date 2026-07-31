import { formatMMDDYY, generateBankTxt, generatePNBExcel } from "./payroll_archive.helper";
import {  buildPayslipData, displayBankAdminBDO, displayCompletePayroll, getAvailableCompanyCyclesService, getEmployeeArchivedService, getPayrollArchiveReportService, getTotalPayrollService, printEmployeeArchivedService, reCheckPayroll, reCheckPayrollToChecker, saveComputedFinalPayroll, saveComputedPayroll, SaveToApproverPayroll, saveWtaxOverrideService, sendBulkPayslipService, sendPayslipEmailService, ViewEmployeeBankAccounts } from "./payroll_archive.service";
import { Request,Response } from "express";
import { BankFileRow, SendPayslipType } from "./payroll_archive.types";
import { prisma } from "../../config/prismaClient";
import { generatePayslipPDF } from "../print/print.service";



export async function saveWtaxOverrideController(req: Request, res: Response) {
  const {
    PayCode,
    EmpCodeId,
    PayrollPeriod,
    computedWtax,
    editedValue
  } = req.body;

  await saveWtaxOverrideService({
    PayCode,
    EmpCodeId,
    PayrollPeriod,
    computedWtax,
    editedValue
  });

  res.json({ success: true });
}



export const displayCompletePayrollController = async (req: Request, res: Response) => {
  try{
    const company_id = req.query.company_id as string;
    const res1 = await displayCompletePayroll(['PENDING'],company_id);
   
    return res.status(200).json({ status: "SUCCESS", data:res1});
  }
  catch(error){
    res.status(500).json({message:`SERVER ERROR: ${error}`})
  }
}


export async function savePayrollController(req: Request, res: Response) {
  try {
    const company_id = req.query.company_id as string;

    const result = await saveComputedPayroll(company_id);
    return res.json({ success: true, res: result });
  } catch (error:any) {
     if (error.message === "PENDING_PAYROLL") {
      return res.status(409).json({
        message: "Cannot save: There is a previous pending payroll",
      });
    }

    console.error("SAVE ALLOWANCE ERROR:", error);
    return res.status(500).json({
      message: "Failed to save allowance",
    });
  }
}


 
export async function saveComputedFinalPayrollController(req:Request, res:Response) {
  try{
    const cycle = req.query.cycle as "10-25-Cycle" | "15-30-Cycle" | undefined;
    const companyId = req.query.companyId as string | undefined; 

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      })
    }

    const approvedBy = req.user.id

    if (!cycle) {
      return res.status(400).json({ message: "cycle is required" });
    }

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" }); 
    }
    
    const result = await saveComputedFinalPayroll(cycle,companyId,approvedBy);
    return res.json({ success: true, res: result })
  }
  catch (error) {
    console.error("SAVE FINAL PAYROLL ERROR:", error);
   
    return res.status(500).json({
    message: error instanceof Error ? error.message : "Failed to save final payroll"
    });
   }
   }



// export const displayForApprovalController = async (req: Request, res: Response) => {
//   try{
//     const company_id = req.query.company_id as string;

//     const data = await displayCompletePayroll(company_id,['FOR_CHECKER']);

//     return res.status(200).json({ status: "SUCCESS",data });
//   }
//   catch(error){
//     res.status(500).json({message:`SERVER ERROR: ${error}`})
//   }
// }



export const displayForApprovalController = async (req: Request, res: Response) => {
  try {
    const company_id = req.query.company_id as string;
    const status = req.query.status as "PENDING" | "FOR_CHECKER" | "FOR_APPROVER";

    const data = await displayCompletePayroll([status],company_id);
    const availableCompany = await getAvailableCompanyCyclesService([status]);

    //console.log(availableCompany)

    return res.status(200).json({
      status: "SUCCESS",
      availableCompany,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: `SERVER ERROR: ${error}` });
  }
};




export async function reCheckPayrollController(req: Request, res: Response) {
  try {
    const company_id = req.query.company_id as string;
    const result = await reCheckPayroll(company_id);
    return res.json({ success: true, res: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save payroll" });
  }
}


export async function reCheckPayrollToCheckerController(req:Request,res: Response){
  try{

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      })
    }

    const approvedBy = req.user.id

    const company_id = req.query.company_id as string;
    const result = await reCheckPayrollToChecker(company_id,approvedBy);
    return res.json({ success: true, res: result });
  }
  catch (error) {
    console.error("SAVE FINAL PAYROLL ERROR:", error);
    return res.status(500).json({
    message: error instanceof Error ? error.message : "Failed to save final payroll"
    });
   }
}


export async function getTotalPayrollController(
  req: Request,
  res: Response
) {
  try {
    const page = Number(req.query.page) || 1
    const pageSize = Number(req.query.pageSize) || 10
    const search = req.query.search as string | undefined
    const payCycle = req.query.payCycle as string | undefined

    const payroll = await getTotalPayrollService({
      page,
      pageSize,
      search,
      payCycle,
    })

    return res.status(200).json(payroll)
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch total payroll",
    })
  }
}


export async function getEmployeeArchivedController(
  req: Request,
  res: Response
) {
  try{
      const page = Number(req.query.page) || 1
      const pageSize = Number(req.query.pageSize) || 10
      const search = req.query.search as string | undefined
      const totalPayrollId = Number(req.query.totalPayrollId) || 0
      const selectedCompany = req.query.selectedCompany as string | undefined;
      const selectedBranch = req.query.selectedBranch as string | undefined;

      const archived = await getEmployeeArchivedService({
        page,
        pageSize,
        search,
        totalPayrollId,
        selectedCompany,
        selectedBranch
      })

      return res.status(200).json(archived)
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch employee archived",
    })
  }

}

export async function printEmployeeArchivedController(
  req: Request,
  res: Response
) {
  try {
    const search = req.query.search as string | undefined;
    const totalPayrollId = Number(req.query.totalPayrollId) || 0;
    const selectedCompany = req.query.selectedCompany as string | undefined;
    const selectedBranch = req.query.selectedBranch as string | undefined;

    const data = await printEmployeeArchivedService({
      totalPayrollId,
      search,
      selectedCompany,
      selectedBranch
    });

    return res.status(200).json(data);

  } catch {
    return res.status(500).json({
      message: "Failed to print employee archived",
    });
  }
}




export async function ViewEmployeeBankAccountsController(req:Request,res:Response){

  try{
    const cycle = req.query.cycle_category as "10-25-Cycle" | "15-30-Cycle" | undefined;
    const paycode = req.query.PayCode as string | undefined;
    const company_id = req.query.company_id as string;


    if (!paycode || !cycle) {
      return res.status(500).json({message:"no paycode or cycle"});
    }

    const data = await ViewEmployeeBankAccounts({
      PayCode:paycode,
       cycle_category:cycle,
       company_id:company_id,
      });

   

    return res.status(200).json(data);
  }

  catch(error){
    console.error("Error Occured",error);
    res.status(500).json({message:'failed to fetch data'})
  }

}






export async function GenerateBankFileController(req: Request,res: Response) {
  try {
    const rows = req.body as BankFileRow[];
    const bank = String(req.query.bank).trim().toUpperCase();
    const company_id = req.query.company_id as string;

    const bankAdmins = await displayBankAdminBDO();

    if (!bank || !Array.isArray(rows)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const normalized = rows
      .filter((row) => row.bankAccount)
      .map((row) => ({
        bankAccount: row.bankAccount,
        amount: Number(row.amount) || 0,
      }));

    const today = formatMMDDYY(new Date());

    // ================= BDO =================
    if (bank === "BDO") {

    
      const fileContent = generateBankTxt(normalized);
    
      const filename = `${bankAdmins?.[0].company_code}${today}${bankAdmins?.[0].batch}.txt`

      return res.json({
        filename,
        file: Buffer.from(fileContent).toString("base64"),
        mime: "text/plain",
      });
    }

    // ================= PNB =================
    if (bank === "PNB") {
      const buffer = await generatePNBExcel(normalized);
      const filename = `PNB${today}${company_id}.xlsx`;

      return res.json({
        filename,
        file: Buffer.from(buffer).toString("base64"),
        mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    }

    return res.status(400).json({ message: "Unsupported bank" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to generate file" });
  }
}




//KIM

export async function SaveToApproverPayrollController(req: Request, res: Response) {
  try {
    const company_id = req.query.company_id as string;
   

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      })
    }

    const approvedBy = req.user.id

    const result = await SaveToApproverPayroll(company_id,approvedBy);

   

    return res.json({ success: true, res: result });
  }  catch (error) {
    console.error("SAVE FINAL PAYROLL ERROR:", error);
   
    return res.status(500).json({
    message: error instanceof Error ? error.message : "Failed to save final payroll"
    });
   }
}


export async function getPayrollArchiveReportController(
  req: Request,
  res: Response
) {
  try {
    const payrollId = Number(req.params.id);
    const companyId = req.query.company_id as string;

    if (!payrollId) {
      return res.status(400).json({
        message: "Payroll ID is required"
      });
    }

    if (!companyId) {
      return res.status(400).json({
        message: "Company ID is required"
      });
    }

    const report = await getPayrollArchiveReportService(
      payrollId,
      companyId
    );

    return res.status(200).json({
      success: true,
      data: report
    });

  }catch (err: any) {
    switch (err?.code) {
      case "PAYROLL_NOT_FOUND":
        return res.status(400).json(err)
      default:
        return res.status(500).json({
          message: "Internal server error"
        })
    }
  }
}






type SendPayslipEmailBody = {
  archiveId?: unknown;
};

export async function sendPayslipEmailController(
  req: Request<
    Record<string, never>,
    unknown,
    SendPayslipEmailBody
  >,
  res: Response
) {
  try {
    const { archiveId } = req.body;

    if (
      typeof archiveId !== "number" ||
      !Number.isInteger(archiveId) ||
      archiveId <= 0
    ) {
      return res.status(400).json({
        message: "Valid archive ID is required",
      });
    }

    await sendPayslipEmailService(
      archiveId
    );

    return res.status(200).json({
      success: true,
      message: "Payslip sent successfully",
    });
  } catch (error: unknown) {
    console.error(
      "Payslip email error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to send payslip";

    if (
      message ===
      "Payslip archive record not found"
    ) {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message,
    });
  }
}



export const sendBulkPayslipController = async (req: Request, res: Response) => {
  try {
    const { totalPayrollId, selectedCompany, selectedBranch, search } = req.body;

    await sendBulkPayslipService({
      totalPayrollId,
      selectedCompany,
      selectedBranch,
      search,
    });

    return res.json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send bulk payslips" });
  }
};




export async function previewPayslipController(
  req: Request,
  res: Response
) {
  try {
    const archiveId = Number(req.query.archiveId);

    if (!Number.isInteger(archiveId)) {
      return res.status(400).json({
        message: "Invalid archive ID",
      });
    }

    const employee =  await prisma.employeePayrollArchive.findUnique({
        where: {
          id: archiveId,
        },
        include: {
          EmpCode: {
            include: {
              employeepayroll: true,
              BranchCode: true,
            },
          },
        },
      });

    if (!employee) {
      return res.status(404).json({
        message: "Payslip not found",
      });
    }

const payslipData =
  buildPayslipData(employee);


    const pdf = await generatePayslipPDF(
      payslipData
    );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="Payslip-${employee.EmpCodeId}.pdf"`
    );

    return res.send(pdf);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to preview payslip",
    });
  }
}
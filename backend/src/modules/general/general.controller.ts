import { Request, Response } from "express";
import { assignBranchService, createGroupService, deleteGroupService, fetchCompanyCycles, getAllCompanies, getBranch, getBranchesDetailsService, getCompaniesByCode, getCompaniesByCycle, getCompanyDetailsServices, getGroupsService, getUniqueLoan, reorderBranchesService } from "./general.services";
import { string } from "zod";
import { getBrowser } from "../../utils/pdfBrowser";


export async function getCompanyDetailsController(
   req: Request,
   res: Response
) {
    try{
        const companyDetails = await getCompanyDetailsServices()
        return res.status(200).json(companyDetails)
    }catch(error){
        console.error(error)
        return res.status(500).json({
            message: "Failed to company details"
        })
    }
}





export async function getCompaniesByCycleController(req: Request, res: Response) {
    try {
      const { cycle }  = req.query;
  
      if(!cycle || typeof cycle !== "string"){
          return res.status(400).json({message:"cycle is required"});
      }
  
      const result = await getCompaniesByCycle(cycle);
      return res.json({ success: true, data: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  }



  export async function fetchCompanyCyclesController(req: Request, res: Response) {
    try {
      const result = await fetchCompanyCycles()
      
      return res.json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch cycles" });
    }
  }
  
export async function getCompaniesByCodeController(req: Request, res: Response) {
    try {
      const CompanyCode = req.params.CompanyCode
      if(!CompanyCode || typeof CompanyCode !== "string"){
          return res.status(400).json({message:"code is required"});
      }
      const result = await getCompaniesByCode(CompanyCode);
      return res.json({ success: true, data: result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  }

  export const generatePdfController = async (req: Request, res: Response) => {
    try {
      const { path, download } = req.query;
  
      if (!path || typeof path !== "string") {
        return res.status(400).send("Missing path parameter");
      }
  
      const browser = await getBrowser(); 
      const page = await browser.newPage();
  
      //const fullUrl = `http://localhost:3000${path}`;
      const fullUrl = `${process.env.FRONTEND_LAN_URL}${path}`;
  
      await page.goto(fullUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      
      await page.waitForSelector("#pdf-ready");

   
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin:{
          top:"2mm",
          bottom:"2mm",
        },
      });
  
      await page.close(); // close page only
  
      res.setHeader("Content-Type", "application/pdf");
      if (download === "true") {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="Allowance.pdf"`
        );
      } else {
        res.setHeader("Content-Disposition", "inline");
      }
  
      res.send(pdf);
  
    } catch (error) {
      console.error(error);
      res.status(500).send("PDF generation failed");
    }
  };



export const getCompaniesController = async (_req: Request, res: Response) => {
  try {
    const companies = await getAllCompanies();

    return res.json({
      data: companies,
    });
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return res.status(500).json({
      message: "Failed to fetch companies",
    });
  }
};


export const getUniqueLoanController = async (
  req: Request,
  res: Response
) => {
  try {
    const loans = await getUniqueLoan();

    res.status(200).json({
      success: true,
      data: loans
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch loan types"
    });
  }
};


export async function getBranchesDetailsController(
  req: Request,
  res: Response
) {

  try{
    const branches = await getBranchesDetailsService()
    res.status(200).json({
      success: true,
      data: branches
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch branches"
    });
  }
  
}


export const reorderBranchesController = async (
  req: Request,
  res: Response
) => {

  try {

    const { company_id, branchCodes } = req.body

    if (!company_id || !branchCodes) {
      return res.status(400).json({
        success: false,
        message: "Invalid request payload"
      })
    }

    await reorderBranchesService(company_id, branchCodes)

    res.json({
      success: true,
      message: "Branch order updated"
    })

  } catch (error: any) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }

}






export const getBranchController = async (req:Request, res:Response) => {
  try{
    const data = await getBranch();

    return res.status(200).json(data);
  }
  catch(error){
    console.error("error occured",error);
  }
}



// CREATE
export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = await createGroupService(name.toUpperCase());

    res.json(group);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// GET ALL
export const getGroups = async (_req: Request, res: Response) => {
  try {
    const data = await getGroupsService();
    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch groups" });
  }
};

// DELETE
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await deleteGroupService(id);

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to delete group" });
  }
};

// ASSIGN
export const assignBranch = async (req: Request, res: Response) => {
  try {
    const { branchCode } = req.params;
    const { groupId } = req.body;

    await assignBranchService(
      branchCode,
      groupId ? Number(groupId) : null
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to assign branch" });
  }
};
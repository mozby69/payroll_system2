import { Request, Response } from "express";
import {  getCompaniesByCycle, getCompanyDetailsServices } from "./general.services";
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



  export const generatePdfController = async (req: Request, res: Response) => {
    try {
      const { path } = req.query;
  
      if (!path || typeof path !== "string") {
        return res.status(400).send("Missing path parameter");
      }
  
      const browser = await getBrowser(); // reused
      const page = await browser.newPage();
  
      const fullUrl = `http://localhost:3000${path}`;
  
      await page.goto(fullUrl, {
        waitUntil: "networkidle2",
       // waitUntil: "domcontentloaded"
      });

   
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
      });
  
      await page.close(); // close page only
  
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
      res.send(pdf);
  
    } catch (error) {
      console.error(error);
      res.status(500).send("PDF generation failed");
    }
  };




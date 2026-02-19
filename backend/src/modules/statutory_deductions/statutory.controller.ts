import { displayPagibigContributions, displaySSSContributions, updatePagibigContribution, updateSSSContribution } from "./statutory.service";

import { Request,Response } from "express";





export const displaySSSContributionsController = async (req: Request, res: Response) => {
    try{
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
      const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
  
      const data = await displaySSSContributions({page,limit,search});
  
      return res.status(200).json(data);
    }
    catch(error){
      res.status(500).json({message:`SERVER ERROR: ${error}`})
    }
  }



  export const updateSSSContributionController = async (req: Request,res: Response) => {
    try {
      const id = Number(req.params.id);
      const updated = await updateSSSContribution(id, req.body);
  
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({message: `SERVER ERROR: ${error}`});
    }
  };
  

  export const updatePagibigContributionController = async (req: Request, res:Response) => {
    try{
      const id = Number(req.params.id);
      const updated = await updatePagibigContribution(id, req.body);
      return res.status(200).json(updated);
    }
    catch(error){
      return res.status(500).json({ message: `SERVERO ERROR ${error}`})
    }
  }



  export const displayPagibigContributionsController = async (req: Request, res: Response) => {
    try{
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
      const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
  
      const data = await displayPagibigContributions({page,limit,search});
  
      return res.status(200).json(data);
    }
    catch(error){
      res.status(500).json({message:`SERVER ERROR: ${error}`})
    }
  }

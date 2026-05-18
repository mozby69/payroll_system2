import { displayPagibigContributions, displayPhilhealthContribution, displaySSSContributions, 
  displayWTax, updatePagibigContribution, updatePhilhealth, updateSSSContribution, updateWTax, wtaxComputationList } from "./statutory.service";

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


  export const updatePhilhealthController = async (req: Request, res: Response) => {
    try{
      const id = Number(req.params.id);
      const { SettingPercentage } = req.body;

      const updated = await updatePhilhealth(
        id,
        SettingPercentage
      );

      return res.status(200).json(updated);
    }
    catch(error){
      return res.status(500).json({ message: `SERVER ERROR ${error}`})
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


export const displayPhilhealthContributionController = async (req:Request, res:Response) =>{
  try{
    const data = await displayPhilhealthContribution();
    return res.status(200).json(data);
  }
  catch(error){
    res.status(500).json({message:`server error ${error}`});
  }
}


export const displayWTaxController = async (req:Request, res:Response) => {
  try{
    const data = await displayWTax();
    return res.status(200).json(data);
  }
  catch(error){
    res.status(500).json({message:`server error ${error}`})
  }
}


export const updateWTaxController = async (req: Request, res:Response) => {
  try{
    const id = Number(req.params.id);
    const updated = await updateWTax(id, req.body);
    return res.status(200).json(updated);
  }
  catch(error){
    return res.status(500).json({ message: `SERVER ERROR ${error}`})
  }
}


export const wtaxComputationListController = async (req:Request, res:Response) => {
  try{
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
      const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
      const data = await wtaxComputationList({page,limit,search});
      return res.status(200).json(data);
  }
  catch(error){
    return res.status(500).json({message: `SERVER ERROR ${error}`});
  }
}
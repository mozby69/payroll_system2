import { displayPagibigContributions, displayPhilhealthContribution, displaySSSContributions, 
  DisplayWtax, 
  displayWTax, DisplayWtaxPaid, SaveWtaxMonthly, updatePagibigContribution, updatePhilhealth, updateSSSContribution, updateWTax, wtaxComputationList, 
  WtaxFetchData} from "./statutory.service";

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

export const saveWtaxMonthlyController =async (req: Request,res: Response) => {
    try {
      const { month,year,taxAmount, empCodeId } = req.body;

      const result =
        await SaveWtaxMonthly({
          month,
          year,
          taxAmount,
          empCodeId,
        });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `SERVER ERROR: ${error}`,
      });
    }
  };




  export const displayWtaxController = async (req: Request,res: Response) => {
    try {

      const { empCodeId } = req.params;
      const data = await DisplayWtax({empCodeId});
      return res.status(200).json({data});

    } catch (error) {
      return res.status(500).json({
        message: `SERVER ERROR ${error}`,
      });
    }
  };



export const DisplayWtaxPaidController = async (req:Request, res:Response) =>  {
  try{

    const { empCodeId } = req.params;
    const month = (Number(req.query.month));
    const year = (Number(req.query.year));

    const data = await DisplayWtaxPaid({empCodeId,month,year});



    return res.status(200).json({data});

  }
  catch(error){
    return res.status(500).json({message: `server error ${error}`})
  }
}




export const WtaxFetchDataController = async (req: Request,res: Response) => {
  try {
    const empcode = String(req.query.empcode);
    const month = Number(req.query.month);
    const year = Number(req.query.year);


    const data = await WtaxFetchData({empcode,month,year});

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({
      message: `server error ${error}`,
    });
  }
};
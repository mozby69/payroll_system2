import { Request,Response } from "express";
import { importSQLService } from "./import.service";


export const importSQLHandler = async (req:Request,res:Response): Promise<void> => {

    try{

    const filePath = req.file?.path;
    const originalFileName = req.file?.originalname || '';

    const result = await importSQLService(filePath,originalFileName);
    res.status(200).json({message:result.message});
        
    }
    catch(error){
        console.error("error occured in controller");
        res.status(500).json({message:'error occured in controller'});
    }
};


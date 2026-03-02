// modules/import/import.controller.ts
import { Request, Response } from "express";
import { importAttendanceCountService, importBranchesService, saveBranches } from "./import.service";


export const importBranches = async (_req: Request, res: Response) => {
    const inserted = await importBranchesService();
  
    res.status(200).json({
      message: "Import completed",
      inserted,
    });
  };


  
  export const importAttendanceCount = async ( _req: Request, res: Response) => {
    const inserted = await importAttendanceCountService();
  
    res.status(200).json({
      message: "Attendance count import completed",
      inserted,
    });
  };
import { Request, Response } from "express";
import { saveOneYearOldDataToArchive,saveOneYearOldDataSummaryService } from "./data_archive.service";


export const SaveOneYearOldDataArchive = async (req: Request,res: Response): Promise<void> => {
  const result = await saveOneYearOldDataToArchive();

  res.status(result.status).json({
    message: result.message,
    deletedCount: result.deletedCount ?? 0,
    csvPath: result.csvPath ?? null,
    error: result.error ?? null,
  });
};




export const SaveOneYearOldDataSummary = async (req: Request,res: Response): Promise<void> => {
    const result = await saveOneYearOldDataSummaryService();
  
    res.status(result.status).json({
      message: result.message,
      deletedCount: result.deletedCount ?? 0,
      csvPath: result.csvPath ?? null,
      error: result.error ?? null,
    });
  };
import { Request, Response } from "express";
import { hrApi } from "../../lib/hrApi";
import { ApiParams } from "../../types/utilsTypes";
import { fetchHrAttendance, saveEmployeeAttendance, transformAttendanceData } from "./api.services";

export const getAttendance = async (req: Request, res: Response) => {
    try {
      const params = req.body as ApiParams;

      if (!params.startDate || !params.endDate) {
        return res.status(400).json({
          message: "startDate and endDate are required",
        });
      }
  
      if (new Date(params.endDate) < new Date(params.startDate)) {
        return res.status(400).json({
          message: "endDate cannot be earlier than startDate",
        });
      }
        const data = await fetchHrAttendance(params)
   
        const employees = transformAttendanceData(data, params);
        
        const saveEmployeeSummary =saveEmployeeAttendance(employees);
      
         res.status(200).json(saveEmployeeSummary);



    } catch (error: any) {
      console.error("HR API ERROR:", error.response?.data || error.message);
      res.status(500).json({
        message: "Failed to fetch attendance from HR system",
        error: error.response?.data || error.message,
      });
    }
  };
  
import getAttendanceCount, { updateVacationLeave } from "./conversion.service";
import { Request,Response } from "express";




export const getAttendanceCountController = async (req: Request, res: Response) => {
  try {

     const page = Math.max(Number(req.query.page) || 1, 1);
     const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
      const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    const result = await getAttendanceCount({page,limit,search});
    return res.status(200).json(result);
  } catch (error) {
    console.error("FETCH DATA ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch data",
    });
  }
};


export const updateVacationLeaveController = async (req: Request, res:Response) => {
  try{
    const id = Number(req.params.id);
    const updated = await updateVacationLeave(id, req.body);
    return res.status(200).json(updated);
  }
  catch(error){
    return res.status(500).json({ message: `SERVER ERROR ${error}`})
  }
}

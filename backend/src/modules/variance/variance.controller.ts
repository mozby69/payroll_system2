import {  fetchVariance } from "./variance.service";
import { Request, Response } from "express";




export async function fetchVarianceController(req: Request, res: Response) {
    try {

      const result = await fetchVariance();

      return res.json(  result  );
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to save payroll" });
    }
  }
  
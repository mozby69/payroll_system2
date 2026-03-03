import { Request, Response } from "express"
import { printPayroll } from "./print.service"

export const printPayrollController = (req: Request, res: Response) => {

  const rows = req.body.rows

  printPayroll(rows)

  return res.json({ success: true })
}
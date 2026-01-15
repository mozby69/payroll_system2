import { Request, Response } from "express";
import { fetchEmployeesByPayrollCycle } from "./prepare_payroll.service";




export const getEmployeesByCycle = async (
  req: Request,
  res: Response
) => {
  const cycle = req.query.cycle as "10-25-Cycle" | "15-30-Cycle" | undefined;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : undefined;

  if (!cycle) {
    return res.status(400).json({ message: "cycle is required" });
  }

  const result = await fetchEmployeesByPayrollCycle({
    cycle,
    page,
    limit,
    search,
  });

  res.json(result);
};






import { Request, Response } from "express";
import * as employeeService from "./emp.services";

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      employeeService.getAllEmployees({ skip, take: limit }),
      employeeService.countEmployees(),
    ]);

    return res.json({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};

import * as employeeService from "./emp.services";
const normalizeArray = (value) => {
    if (value === undefined)
        return undefined;
    if (Array.isArray(value))
        return value;
    return [String(value)];
};
export const getEmployees = async (req, res) => {
    try {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);
        const search = String(req.query.search ?? "");
        const department = normalizeArray(req.query["department[]"]);
        const company = normalizeArray(req.query["company[]"]);
        const status = normalizeArray(req.query["status[]"]);
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            employeeService.getAllEmployees({
                skip,
                take: limit,
                search,
                department,
                company,
                status,
            }),
            employeeService.countEmployees({
                search,
                department,
                company,
                status,
            }),
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch employees" });
    }
};
export const getEmployeeByEmpCode = async (req, res) => {
    try {
        const { empCode } = req.params;
        const employee = await employeeService.getEmployeeByEmpCode(empCode);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        return res.json(employee);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch employee" });
    }
};
export const updateEmployeePayrollByEmpCode = async (req, res) => {
    try {
        const { empCode } = req.params;
        if (!empCode) {
            return res.status(400).json({ message: "Employee code is required" });
        }
        const { basicSalary, cashAssistance, ecola, pagibigEmployeeShare, WithAtm, Disbursing, remarks, } = req.body;
        const changedBy = req.user?.username || "SYSTEM";
        const updated = await employeeService.updateEmployeePayroll(empCode, {
            basicSalary: Number(basicSalary),
            cashAssistance: Number(cashAssistance),
            ecola: Number(ecola),
            pagibigEmployeeShare: Number(pagibigEmployeeShare),
            WithAtm: Boolean(WithAtm),
            Disbursing: Boolean(Disbursing),
            remarks: remarks ? String(remarks) : undefined,
        }, changedBy);
        return res.json(updated);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to update payroll" });
    }
};
export const getCompanies = async (_req, res) => {
    try {
        const companies = await employeeService.getAllCompanies();
        return res.json({
            data: companies,
        });
    }
    catch (error) {
        console.error("Failed to fetch companies:", error);
        return res.status(500).json({
            message: "Failed to fetch companies",
        });
    }
};
export const getEmployeesByCompany = async (req, res) => {
    try {
        const { companyCode } = req.params;
        if (!companyCode) {
            return res.status(400).json({ message: "Company code required" });
        }
        const employees = await employeeService.getEmployeesByCompanyGrouped(companyCode);
        return res.json({ data: employees });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch employees by company",
        });
    }
};
export const bulkIncreaseEmployeeSalary = async (req, res) => {
    try {
        const { empCodes, amount, reason } = req.body;
        if (!Array.isArray(empCodes) || empCodes.length === 0) {
            return res.status(400).json({
                message: "No employees selected",
            });
        }
        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                message: "Invalid amount",
            });
        }
        if (!reason) {
            return res.status(400).json({
                message: "Reason is required",
            });
        }
        const changedBy = req.user?.username || "SYSTEM";
        const result = await employeeService.bulkIncreaseSalary(empCodes, Number(amount), String(reason), changedBy);
        return res.json(result);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to increase salaries",
        });
    }
};

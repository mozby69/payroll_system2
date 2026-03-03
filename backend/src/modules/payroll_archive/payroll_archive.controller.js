import { formatMMDDYY, generateBankTxt, generatePNBExcel } from "./payroll_archive.helper";
import { displayBankAdminBDO, displayCompletePayroll, employeeProbationary, getEmployeeArchivedService, getTotalPayrollService, printEmployeeArchivedService, reCheckPayroll, saveComputedFinalPayroll, saveComputedPayroll, ViewEmployeeBankAccounts } from "./payroll_archive.service";
export const displayCompletePayrollController = async (req, res) => {
    try {
        const res1 = await displayCompletePayroll(['PENDING']);
        const res2 = await employeeProbationary();
        return res.status(200).json({ status: "SUCCESS", data: res1, xxx: res2 });
    }
    catch (error) {
        res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
};
export async function savePayrollController(req, res) {
    try {
        const result = await saveComputedPayroll();
        return res.json({ success: true, res: result });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to save payroll" });
    }
}
export async function saveComputedFinalPayrollController(req, res) {
    try {
        const result = await saveComputedFinalPayroll();
        return res.json({ success: true, res: result });
    }
    catch (error) {
        console.error("error", error);
        res.status(500).json({ message: "failed to save final payroll" });
    }
}
export const displayForApprovalController = async (req, res) => {
    try {
        const data = await displayCompletePayroll(['FOR_APPROVAL']);
        return res.status(200).json({ status: "SUCCESS", data });
    }
    catch (error) {
        res.status(500).json({ message: `SERVER ERROR: ${error}` });
    }
};
export async function reCheckPayrollController(req, res) {
    try {
        const result = await reCheckPayroll();
        return res.json({ success: true, res: result });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to save payroll" });
    }
}
export async function getTotalPayrollController(req, res) {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const search = req.query.search;
        const payCycle = req.query.payCycle;
        const payroll = await getTotalPayrollService({
            page,
            pageSize,
            search,
            payCycle,
        });
        return res.status(200).json(payroll);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch total payroll",
        });
    }
}
export async function getEmployeeArchivedController(req, res) {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const search = req.query.search;
        const totalPayrollId = Number(req.query.totalPayrollId) || 0;
        const selectedCompany = req.query.selectedCompany;
        const selectedBranch = req.query.selectedBranch;
        const archived = await getEmployeeArchivedService({
            page,
            pageSize,
            search,
            totalPayrollId,
            selectedCompany,
            selectedBranch
        });
        return res.status(200).json(archived);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch employee archived",
        });
    }
}
export async function printEmployeeArchivedController(req, res) {
    try {
        const search = req.query.search;
        const totalPayrollId = Number(req.query.totalPayrollId) || 0;
        const selectedCompany = req.query.selectedCompany;
        const selectedBranch = req.query.selectedBranch;
        const data = await printEmployeeArchivedService({
            totalPayrollId,
            search,
            selectedCompany,
            selectedBranch
        });
        return res.status(200).json(data);
    }
    catch {
        return res.status(500).json({
            message: "Failed to print employee archived",
        });
    }
}
export async function ViewEmployeeBankAccountsController(req, res) {
    try {
        const cycle = req.query.cycle_category;
        const paycode = req.query.PayCode;
        if (!paycode || !cycle) {
            return res.status(500).json({ message: "no paycode or cycle" });
        }
        const data = await ViewEmployeeBankAccounts({
            PayCode: paycode,
            cycle_category: cycle
        });
        return res.status(200).json(data);
    }
    catch (error) {
        console.error("Error Occured", error);
        res.status(500).json({ message: 'failed to fetch data' });
    }
}
export async function GenerateBankFileController(req, res) {
    try {
        const rows = req.body;
        const bank = String(req.query.bank).trim().toUpperCase();
        const bankAdmins = await displayBankAdminBDO();
        if (!bank || !Array.isArray(rows)) {
            return res.status(400).json({ message: "Invalid request" });
        }
        const normalized = rows
            .filter((row) => row.bankAccount)
            .map((row) => ({
            bankAccount: row.bankAccount,
            amount: Number(row.amount) || 0,
        }));
        const today = formatMMDDYY(new Date());
        // ================= BDO =================
        if (bank === "BDO") {
            const fileContent = generateBankTxt(normalized);
            const filename = `${bankAdmins?.[0].company_code}${today}${bankAdmins?.[0].batch}.txt`;
            return res.json({
                filename,
                file: Buffer.from(fileContent).toString("base64"),
                mime: "text/plain",
            });
        }
        // ================= PNB =================
        if (bank === "PNB") {
            const buffer = await generatePNBExcel(normalized);
            const filename = `PNB${today}.xlsx`;
            return res.json({
                filename,
                file: Buffer.from(buffer).toString("base64"),
                mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
        }
        return res.status(400).json({ message: "Unsupported bank" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to generate file" });
    }
}

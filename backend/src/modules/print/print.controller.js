import { printPayroll } from "./print.service";
export const printPayrollController = (req, res) => {
    const rows = req.body.rows;
    printPayroll(rows);
    return res.json({ success: true });
};

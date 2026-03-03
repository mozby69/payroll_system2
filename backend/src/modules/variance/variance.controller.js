import { fetchEmployeeVariance, fetchVariance } from "./variance.service";
export async function fetchVarianceController(req, res) {
    try {
        const result = await fetchVariance();
        const employeeVariance = await fetchEmployeeVariance();
        return res.json({ success: true, current_period: result, employee: employeeVariance });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to save payroll" });
    }
}

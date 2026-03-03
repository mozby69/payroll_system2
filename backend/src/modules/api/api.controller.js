import { fetchHrAttendance, getDisabledPayrollRangesByCycle, saveEmployeeAttendance, transformAttendanceData } from "./api.services";
export const getAttendance = async (req, res) => {
    try {
        const params = req.body;
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
        // Fetch data from HR system
        const data = await fetchHrAttendance(params);
        // Transform the data
        const employees = transformAttendanceData(data, params);
        // IMPORTANT: await the save operation
        await saveEmployeeAttendance(employees);
        // Return success response with count
        res.status(200).json({
            message: "Employee attendance saved successfully",
            count: employees.length,
            params: {
                startDate: params.startDate,
                endDate: params.endDate,
                branchCycle: params.branchCycle
            }
        });
    }
    catch (error) {
        console.error("HR API ERROR:", error.response?.data || error.message);
        if (error.message?.includes("already submitted for approval")) {
            return res.status(409).json({
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Failed to fetch attendance from HR system",
            // error: error.response?.data || error.message,
        });
    }
};
export async function getDisabledPayrollDatesController(req, res) {
    const cycle = req.query.cycle;
    if (!cycle) {
        return res.status(400).json({
            message: "cycle query parameter is required",
        });
    }
    const data = await getDisabledPayrollRangesByCycle(cycle);
    res.json(data);
}

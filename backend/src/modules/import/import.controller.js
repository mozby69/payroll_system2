import { importAttendanceCountService, importBranchesService } from "./import.service";
export const importBranches = async (_req, res) => {
    const inserted = await importBranchesService();
    res.status(200).json({
        message: "Import completed",
        inserted,
    });
};
export const importAttendanceCount = async (_req, res) => {
    const inserted = await importAttendanceCountService();
    res.status(200).json({
        message: "Attendance count import completed",
        inserted,
    });
};

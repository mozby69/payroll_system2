import { hrApi } from "../../lib/hrApi";
import { ApiParams } from "../../types/utilsTypes";

export async function fetchHrAttendance(params: ApiParams){
    const {startDate, endDate, branchCycle} = params;

    const response = await hrApi.get("/attendance/summary/", {
        params: {
            startDate,
            endDate,
            branchCycle
        },
    });

    return response.data;
}
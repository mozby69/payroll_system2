import api from "./axios";

export interface UpdateVarianceRemarkPayload {
  selectedMonth: string;
  empCode: string;
  varianceType: "ADD" | "LESS";
  remarks: string;
}

export async function updateVarianceRemark(payload: UpdateVarianceRemarkPayload) {
  const response = await api.put(
    "allowance/variance-employee-remark-edit",
    payload
  );

  return response.data;
}
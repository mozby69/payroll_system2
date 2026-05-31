import { CreatePayrollPayload } from "../hooks/useManualPayroll";
import api from "./axios";



export interface SelectedPayrollDate {
  start_date: string;
  end_date: string;
}
export interface ExistingPaycodeProps{
    PayCode:string;
    createdAt:string | null;
    selected_payroll_date: SelectedPayrollDate | null;
}


export async function getExistingPaycode(): Promise<ExistingPaycodeProps[]> {
  const res = await api.get<ExistingPaycodeProps[]>("/manual-payroll/fetch-existing-paycode");
  return res.data;
}




export async function createPayroll(payload: CreatePayrollPayload): Promise<void> {
  await api.post("/manual-payroll/create-payroll",payload);
}
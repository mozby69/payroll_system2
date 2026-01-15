import axios from "axios";

export const hrApi = axios.create({
  baseURL: process.env.HR_API_BASE_URL,
  headers: {
    "X-PAYROLL-TOKEN": process.env.HR_API_TOKEN!,
    "Content-Type": "application/json",
  },
});

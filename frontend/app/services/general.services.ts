import api from "./axios";

export async function getCompanyDetailsServices() {
    const res = await api.get("/general/company-details")
    return res.data
}
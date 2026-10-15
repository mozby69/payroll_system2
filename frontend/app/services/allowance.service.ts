import { AllowanceApiResponse, AllowancePrintRow, CreateSignatoryPayload, ReportSignatory, Signatory, SignatoryCategory, UpdateSignatoryPayload } from "../types/allowanceType";
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






export async function createSignatory(
  data: CreateSignatoryPayload
) {
  const response = await api.post<AllowanceApiResponse<Signatory>>(
    "/allowance/signatory",
    data
  );

  return response.data;
}



export async function updateSignatory(
  data: UpdateSignatoryPayload
) {
  const response = await api.put<
    AllowanceApiResponse<Signatory>
  >(
    `/allowance/update-signatory/${data.id}`,
    {
      name: data.name,
      position: data.position,
      signatory_type: data.signatory_type,
      category: data.category,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    }
  );

  return response.data;
}






export async function fetchAllowanceSignatories() {
  const response = await api.get<AllowanceApiResponse<Signatory[]>
  >("/allowance/allowance-signatories");

  return response.data;
}



export async function fetchAllowancePrintRows(
  params: {
    month: string;
    company: string;
    branch?: string | null;
  }
) {
  const response =
    await api.get<AllowancePrintRow[]>(
      "/allowance/allowance-list-row",
      {
        params: {
          month: params.month,
          company: params.company,
          ...(params.branch
            ? { branch: params.branch }
            : {}),
        },
      }
    );

  return response.data;
}


export async function fetchSignatoriesByCategory(
  category: SignatoryCategory
): Promise<ReportSignatory[]> {
  const response = await api.get<{
    success: boolean;
    data: ReportSignatory[];
  }>(
    `/allowance/category/${category}`
  );

  return response.data.data;
}
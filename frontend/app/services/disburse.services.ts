import { DisburseDetailsItem, GetMainDisburseParams, GetMainDisburseResponse, UpdateEmployeeSetupPayload } from "../types/disburseType";
import api from "./axios";


export const UpdateEmployeeSetup = async (payload:UpdateEmployeeSetupPayload)=>{
    const {data} = await api.post(
        "/Disburse/save-employee-setup", payload
    );
    return data;
}

export const getMainDisburse = async (
  params: GetMainDisburseParams
): Promise<GetMainDisburseResponse> => {
  const { data } = await api.get("/Disburse/main-disburse", {
    params,
  });

  return data;
};

export const approveDisburse = async (
  mainDisburseId: number
) => {
  const { data } = await api.patch(
    `/Disburse/approve/${mainDisburseId}`
  );

  return data;
};


export const getDisburseDetails = async (
  mainDisburseID: number
): Promise<DisburseDetailsItem[]> => {
  const { data } = await api.get(
    `/Disburse/details/${mainDisburseID}`
  );

  return data;
};
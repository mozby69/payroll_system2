import type { CreateAlertSchema } from "@/app/schema/alert.schema";
import api from "./axios";

export interface AlertConfigurationResponse {
    success: boolean;
    message: string;
    data: {
      id: number;
      isSms: boolean;
      phoneNumber: string | null;
      isEmail: boolean;
      email: string | null;
    };
  }

export async function createAlertConfigurationService(
    data: CreateAlertSchema
  ): Promise<AlertConfigurationResponse> {
    const result = await api.post<AlertConfigurationResponse>(
      "/alert/create-alert",
      data
    );
  
    return result.data;
  }


  export async function getAlertConfiguration() {
    const result = await api.get<AlertConfigurationResponse>(
      "/alert/get-alert"
    );
    return result.data;
}
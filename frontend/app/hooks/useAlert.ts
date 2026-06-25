import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createAlertConfigurationService, getAlertConfiguration } from "../services/alert.services";



export const useCreateAlert = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: createAlertConfigurationService,
        onSuccess: () => {
            qc.invalidateQueries({queryKey:["alerts"]});
        },
    });
}


export const useAlertConfiguration = () => {
    return useQuery({
        queryKey: ["alerts"],
        queryFn: getAlertConfiguration
    });
}
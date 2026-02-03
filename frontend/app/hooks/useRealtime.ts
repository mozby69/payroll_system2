import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../lib/socket";

export function usePayrollRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = () => {
      queryClient.refetchQueries({
        queryKey: ["payroll-display-for-approval"],
      });

      queryClient.refetchQueries({
        queryKey: ["payroll-display"],
      });

      queryClient.refetchQueries({
        queryKey: ["employees-computed"],
      });
    };

    socket.on("payroll:updated", handler);

    return () => {
      socket.off("payroll:updated", handler);
    };
  }, [queryClient]);
}

"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../lib/socket";

export function PayrollRealtimeProvider(): null {
  const queryClient = useQueryClient();

  useEffect(() => {
    const payrollChangedHandler = (): void => {
      queryClient.invalidateQueries({ queryKey: ["payroll-display"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-display-for-approval"] });
      queryClient.invalidateQueries({ queryKey: ["employees-computed"] });
   
    };

    const handler2 = (): void => {
      queryClient.invalidateQueries({ queryKey: ["disabled-payroll-dates"] });
    };

    socket.on("payroll:changed", payrollChangedHandler);
    socket.on("payroll:calendarUpdate", handler2);

    return () => {
      socket.off("payroll:changed", payrollChangedHandler);
      socket.off("payroll:calendarUpdate", handler2);
    };
  }, [queryClient]);

  return null;
}

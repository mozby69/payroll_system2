import { SpreadsheetRow } from "../components/reports/SpreadSheet";

export async function printPayroll(data: SpreadsheetRow[]) {
  const res = await fetch("/api/print/payroll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "payroll",
      paper: "A4",
      orientation: "landscape",
      data,
    }),
  });

  if (!res.ok) throw new Error("Print failed");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url);

  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

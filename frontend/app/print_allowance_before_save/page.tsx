import { Suspense } from "react";
import PrintAllowanceBeforeSave from "./PrintAllowanceBeforesave";

export default function PrintAllowancePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <p>Loading allowance page...</p>
        </div>
      }
    >
      <PrintAllowanceBeforeSave />
    </Suspense>
  );
}
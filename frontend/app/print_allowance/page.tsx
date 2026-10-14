import { Suspense } from "react";
import PrintAllowanceContent from "./PrintallowanceContent";

export default function PrintAllowancePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <p>Loading allowance page...</p>
        </div>
      }
    >
      <PrintAllowanceContent />
    </Suspense>
  );
}
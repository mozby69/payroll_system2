import { formatMonthYear } from "../utils/DateFormatter";

// print/page.tsx
interface Props {
  searchParams: {
    month?: string;
    company?: string;
    branch?: string;
    empId?: string;
  };
}

interface PrintRow {
  EmpCodeId: string;
  name: string;
  cash_allowance: number;
  ecola: number;
  deduct: number;
  loan: number;
  total: number;
}




export default async function AllowancePrintPage({ searchParams }: Props) {
  
  const params = await searchParams; 

  const { month, company, branch,empId } = params;

  if (!month || !company || !branch) {
    return <div>Missing parameters</div>;
  }


  // const res = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/allowance/print-data?month=${month}&company=${company}&branch=${branch}`,
  //   { cache: "no-store" }
  // );


  const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/allowance/print-data?month=${month}&company=${company}&branch=${branch}${empId ? `&empId=${empId}` : ""}`,
  { cache: "no-store" }
);

  const json = await res.json();
  const list: PrintRow[] = json.data ?? [];

  return (
    <div
      id="pdf-ready"
      className="py-0 px-2 w-[210mm] min-h-[297mm] bg-white text-black"
    >
      <div className="text-center text-sm">
        <span className="font-semibold">BRANCH:</span> {branch}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 text-[0.7rem]">
        {list.map((row) => (
          <div
            key={row.EmpCodeId}
            className="border border-gray-800 p-3"
            style={{ breakInside: "avoid" }}
          >
            <div className="flex justify-between">
              <div className="font-semibold">
                <p>EMPLOYEE NAME:</p>
                <p className="mt-3 leading-tight">
                  RECEIVE THE FOLLOWING<br />
                  FOR THE PERIOD COVERED
                </p>
                <p className="mt-2">CASH ASSISTANCE</p>
                <p className="mt-2">ECOLA</p>
                <p className="mt-2">ABSENCES</p>
                <p className="mt-2">LOANS</p>
                <p className="mt-2">TOTAL</p>
                <p className="mt-2">RECEIVED BY</p>
                <p className="mt-2">DATE</p>
              </div>

              <div className="text-right uppercase">
                <p>{row.name}</p>
                <p className="mt-4 font-semibold">
                  {formatMonthYear(month)}
                </p>
                <p className="mt-2">{row.cash_allowance}</p>
                <p className="mt-2">{row.ecola}</p>
                <p className="mt-2">-{row.deduct}</p>
                <p className="mt-2">-{row.loan}</p>
                <p className="mt-2 font-semibold">{row.total}</p>
                <p className="mt-2 border-b w-40">&nbsp;</p>
                <p className="mt-2 border-b w-40">&nbsp;</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



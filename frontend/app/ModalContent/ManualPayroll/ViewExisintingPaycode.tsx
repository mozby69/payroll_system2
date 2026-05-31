import { ExistingPaycodeProps } from "@/app/services/manual_payroll.service";
import { formatDate } from "@/app/utils/DateFormatter";



interface DataProps {
    data: ExistingPaycodeProps[];
}



export default function ViewExistingPaycode({ data }: DataProps) {


    return (

        <div>


            <div className="space-y-3">
                {data.map((item) => (
                    <div key={item.PayCode} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-slate-800">
                                {item.PayCode}
                            </h2>

                            <span className="rounded-md bg-slate-300 px-2 py-1 text-xs font-medium text-slate-600">
                                Recent
                            </span>
                        </div>

                        <div className="mt-3 space-y-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Coverage Period
                            </p>

                            <p className="text-sm text-slate-700">
                                {formatDate(item.selected_payroll_date?.start_date)}
                                {"  "}—{"  "}
                                {formatDate(item.selected_payroll_date?.end_date)}
                            </p>
                        </div>

                        {item.createdAt && (
                            <p className="mt-3 text-xs text-slate-400">
                                Created:{" "}
                                {new Date(item.createdAt).toLocaleString()}
                            </p>
                        )}
                    </div>
                ))}
            </div>


        </div>


    );
}
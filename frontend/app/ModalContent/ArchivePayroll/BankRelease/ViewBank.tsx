import { BankProps } from "@/app/types/totalPayroll";



interface props{
    BDOList:BankProps[];
    PNBList:BankProps[];
}


export default function ViewBank({BDOList,PNBList}:props){
    return(
        <div>

            <div className="pt-4">
                <div>BDO</div>
                <table className="border-collapse w-10/12 border border-gray-300 text-center">
                    <thead>
                        <tr className="bg-gray-300">
                            <th className="py-2">NAME</th>
                            <th>CYCLE</th>
                            <th>BANK</th>
                        </tr>
                    </thead>

                    <tbody>
               
                    {BDOList.map((emp) => (
                        <tr key={emp.id}>
                            <td className="py-1">{emp.EmpCode.Firstname} {emp.EmpCode.Lastname}</td>
                            <td>{emp.cycle_category}</td>
                            <td>{emp.BranchCodeId}</td>
                        </tr>
                             ))}
                    </tbody>
                </table>
            </div>

            <div className="pt-4">
            <div>PNB</div>
                <table className="border-collapse w-10/12 border border-gray-300 text-center">
                    <thead>
                        <tr className="bg-gray-300">
                            <th className="py-2">name</th>
                            <th>CYCLE</th>
                             <th>BANK</th>
                        </tr>
                    </thead>

                    <tbody>
                    {PNBList.map((emp) => (
                        <tr key={emp.id}>
                                          <td className="py-1">{emp.EmpCode.Firstname} {emp.EmpCode.Lastname}</td>
                            <td className="py-1">{emp.cycle_category}</td>
                            <td>{emp.BranchCodeId}</td>
                        </tr>
                             ))}
                    </tbody>
                </table>
            </div>


        </div>
    );
}
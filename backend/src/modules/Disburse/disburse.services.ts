import { prisma } from "../../config/prismaClient"


export async function saveEmployeeSetup(
    employees:{
        empCode:string;
        Disbursing:boolean;
        WithAtm:boolean;
        Taxable: boolean;
    }[]
){
    return await prisma.$transaction(
        employees.map(emp =>
            prisma.employee.update({
                where:{
                    EmpCode:emp.empCode
                },   
                data:{
                    Disbursing:emp.Disbursing,
                    WithAtm: emp.WithAtm,
                    Taxable: emp.Taxable
                }   
            })
        
        )
    );
 
};



type GetMainDisburseParams = {
  payrollPeriod?: string; 
  status?: "AWAITING" | "APPROVED" | "REJECTED";
  page?: number;
  limit?: number;
};

export async function getFilteredMainDisburse({
  payrollPeriod,
  status,
  page = 1,
  limit = 10,
}: GetMainDisburseParams) {
  const skip = (page - 1) * limit;

  let whereClause: any = {};

  if (payrollPeriod) {
    const [year, month] = payrollPeriod.split("-");

    const monthName = new Date(
      Number(year),
      Number(month) - 1
    ).toLocaleString("en-US", { month: "long" });

    whereClause.AND = [
      { payrollPeriod: { startsWith: monthName } },
      { payrollPeriod: { endsWith: year } },
    ];
  }

  if (status) {
    whereClause.status = status;
  }

  const [data, total] = await prisma.$transaction([
    prisma.main_disburse.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: {
          select: { empDisburses: true },
        },
      },
    }),
    prisma.main_disburse.count({
      where: whereClause,
    }),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function approveDisburse(main_disbure_id:number){
    return await prisma.main_disburse.update({
        where:{
            mainDisburseID:main_disbure_id
        },
        data:{
            status:"APPROVED"
        }
    })
}


export async function getMainDisburseDetails(
  mainDisburseID: number
) {
  return await prisma.emp_disburse.findMany({
    where: {
      mainDisburseId: mainDisburseID,
    },
    select: {
      disburseID: true,
      empArchive: {
        select: {
          disburse_amount: true,
          EmpCode: {
            select: {
              EmpCode: true,
              BranchCode: {
                select: {
                  branchCode: true,
                  Company: true,
                  Location: true,
                },
              },
              Firstname: true,
              Lastname: true,
              Position: true,
              Department:true,
            },
          },
        },
      },
    },
  });
}


export async function getDisburseCompanies({
  cycle,
  isDisburse,
}: {
  cycle: "10-25-Cycle" | "15-30-Cycle";
  isDisburse?: boolean;
}) {
  return prisma.company_details.findMany({
    where: {
      CompanyCycle: cycle,
      ...(isDisburse !== undefined && { isDisburse }),
    },
    select: {
      CompanyCode: true,
      CompanyName: true,
      isDisburse: true,
    },
  });
}



export async function saveCompanyDisburseSetup(
  companies: {
    CompanyCode: string;
    isDisburse: boolean;
  }[]
) {
  return await prisma.$transaction(async (tx) => {
    for (const company of companies) {

      await tx.company_details.update({
        where: {
          CompanyCode: company.CompanyCode,
        },
        data: {
          isDisburse: company.isDisburse,
        },
      });


      const branches = await tx.branch.findMany({
        where: {
          company_id: company.CompanyCode,
        },
        select: {
          branchCode: true,
        },
      });

      const branchCodes = branches.map((b) => b.branchCode);

      if (branchCodes.length === 0) continue;

      await tx.employee.updateMany({
        where: {
          BranchCodeId: {
            in: branchCodes,
          },
        },
        data: {
          Disbursing: company.isDisburse,
        },
      });
    }

    return { success: true };
  });
}

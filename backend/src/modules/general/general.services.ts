import { prisma } from "../../config/prismaClient";



export async function getCompanyDetailsServices() {
    return prisma.company_details.findMany({
        orderBy: {
            CompanyCode: "asc"
        }
    })
} 
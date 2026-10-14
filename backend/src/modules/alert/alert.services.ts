import { prisma } from "../../config/prismaClient";
import { CreateAlertSchema } from "./alert.schema";

export async function createAlertConfigurationService(
  data: CreateAlertSchema
) {
  return await prisma.alertConfiguration.upsert({
    where: {
      id: 1,
    },
    update: data,
    create: {
      id: 1,
      ...data,
    },
  });
}


export async function getAlertConfigurationService() {
  return await prisma.alertConfiguration.findUnique({
    where: {
      id: 1,
    },
  });
}
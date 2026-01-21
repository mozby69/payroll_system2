import { Prisma } from "@prisma/client";

export async function generateNextPagibigId(
  tx: Prisma.TransactionClient
) {
  const last = await tx.pagIbig_List.findFirst({
    orderBy: {
      pagibig_id: "desc",
    },
    select: {
      pagibig_id: true,
    },
  });

  if (!last) return "PG1";

  const match = last.pagibig_id.match(/^PG(\d+)$/);
  if (!match) {
    throw new Error("Invalid pagibig_id format");
  }

  return `PG${Number(match[1]) + 1}`;
}

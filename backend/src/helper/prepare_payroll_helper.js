// export async function generateNextPagibigId(
//   tx: Prisma.TransactionClient
// ) {
//   const last = await tx.pagIbig_List.findFirst({
//     orderBy: {
//       pagibig_id: "desc",
//     },
//     select: {
//       pagibig_id: true,
//     },
//   });
//   if (!last) return "PG1";
//   const match = last.pagibig_id.match(/^PG(\d+)$/);
//   if (!match) {
//     throw new Error("Invalid pagibig_id format");
//   }
//   return `PG${Number(match[1]) + 1}`;
// }
export function addMonths(date, months) {
    const result = new Date(date);
    const day = result.getDate();
    result.setMonth(result.getMonth() + months);
    if (result.getDate() !== day) {
        result.setDate(0);
    }
    return result;
}
export function toMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

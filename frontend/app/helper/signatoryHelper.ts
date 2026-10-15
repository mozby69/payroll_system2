import type {
  ReportSignatory,
  ReportSignatories,
} from "@/app/types/allowanceType";

export function mapReportSignatories(
  signatories: ReportSignatory[]
): ReportSignatories {
  const sorted = [...signatories].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      a.id - b.id
  );

  return {
    preparedBy:
      sorted.find(
        (item) =>
          item.signatory_type === "PREPARED_BY"
      ) ?? null,

    checkedBy: sorted.filter(
      (item) =>
        item.signatory_type === "CHECKED_BY"
    ),

    notedBy: sorted.filter(
      (item) =>
        item.signatory_type === "NOTED_BY"
    ),

    approvedBy:
      sorted.find(
        (item) =>
          item.signatory_type === "APPROVED_BY"
      ) ?? null,
  };
}
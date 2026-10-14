import { ArchiveAllowance } from "../types/allowanceType";

type GroupedBranch = {
  branchCode: string;
  branchPosition: number;
  data: ArchiveAllowance[];
};
type CompanyGroupResult = {
  filtered: ArchiveAllowance[];
  complete: ArchiveAllowance[];
  grouped: GroupedBranch[];
};

export function prepareCompanyData(list: ArchiveAllowance[],companyId: string): CompanyGroupResult {

  const filtered = list.filter(
    (r) =>
      r.company_id === companyId &&
      r.branchCode !== `${companyId}-MAIN` &&
      r.position !== "board" &&
      r.position !== "Mancom"
  );

  // full list (for totals)
  const complete = list.filter((r) => r.company_id === companyId);

  // group by branch
  const grouped: GroupedBranch[] = Object.values(
    filtered.reduce<Record<string, GroupedBranch>>((acc, row) => {
      if (!acc[row.branchCode]) {
        acc[row.branchCode] = {
          branchCode: row.branchCode,
          branchPosition: row.branchPosition,
          data: [],
        };
      }

      acc[row.branchCode].data.push(row);
      return acc;
    }, {})
  );

  // sort
  grouped.sort((a, b) => a.branchPosition - b.branchPosition);

  return { filtered, complete, grouped };
}
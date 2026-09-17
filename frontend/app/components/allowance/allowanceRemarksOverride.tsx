import { useUpdateVarianceRemark } from "@/app/hooks/useAllowance";
import {
  useEffect,
  useState,
} from "react";

interface EditableVarianceRemarkProps {
  selectedMonth: string;
  empCode: string;
  varianceType: "ADD" | "LESS";
  initialValue: string;
}

export function EditableVarianceRemark({
  selectedMonth,
  empCode,
  varianceType,
  initialValue,
}: EditableVarianceRemarkProps) {
  const [value, setValue] =
    useState(initialValue);

const { mutate, isPending } = useUpdateVarianceRemark();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
) => {
    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();

    // Triggers onBlur -> handleBlur -> save
    event.currentTarget.blur();
};

  const handleBlur = () => {
    const normalizedValue = value.trim();
    const normalizedInitial =
      initialValue.trim();

    if (
      normalizedValue === normalizedInitial
    ) {
      return;
    }

    mutate({
      selectedMonth,
      empCode,
      varianceType,
      remarks: normalizedValue,
    });
  };

  return (
   <input
    type="text"
    value={value}
    disabled={isPending}
    onChange={(event) =>
        setValue(event.target.value)
    }
    onBlur={handleBlur}
    onKeyDown={handleKeyDown}
    className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-center text-xs font-bold outline-none hover:border-gray-300 focus:border-blue-500 focus:bg-white disabled:opacity-50"
/>
  );
}
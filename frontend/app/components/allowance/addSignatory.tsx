
"use client";

import { useState } from "react";
import {
  useCreateSignatory,
  useUpdateSignatory,
} from "@/app/hooks/useAllowance";

import type {
  Signatory,
  SignatoryType,
  SignatoryCategory,
  CreateSignatoryPayload,
} from "@/app/types/allowanceType";

import SweetAlert from "../Swal";

type SignatoryFormProps = {
  closeModal: () => void;
  onSuccess?: () => void;
  signatory?: Signatory;
};

const SIGNATORY_TYPES: {
  value: SignatoryType;
  label: string;
}[] = [
  { value: "PREPARED_BY", label: "Prepared By" },
  { value: "CHECKED_BY", label: "Checked By" },
  { value: "NOTED_BY", label: "Noted By" },
  { value: "APPROVED_BY", label: "Approved By" },
];

const CATEGORIES: {
  value: SignatoryCategory;
  label: string;
}[] = [
  { value: "BONUS", label: "Bonus" },
  { value: "PAYROLL", label: "Payroll" },
  { value: "ALLOWANCE", label: "Allowance" },
];

function SignatoryForm({
  closeModal,
  onSuccess,
  signatory,
}: SignatoryFormProps) {
  const isEditing = Boolean(signatory);

  const {
    mutateAsync: createSignatory,
    isPending: isCreating,
  } = useCreateSignatory();

  const {
    mutateAsync: updateSignatory,
    isPending: isUpdating,
  } = useUpdateSignatory();

  const isPending = isCreating || isUpdating;

  const [form, setForm] =
    useState<CreateSignatoryPayload>({
      name: signatory?.name ?? "",
      position: signatory?.position ?? "",
      signatory_type:
        signatory?.signatory_type ?? "PREPARED_BY",
      category: signatory?.category ?? "BONUS",
      sortOrder: signatory?.sortOrder ?? 1,
      isActive: signatory?.isActive ?? true,
    });

  function updateField<K extends keyof CreateSignatoryPayload>(
    field: K,
    value: CreateSignatoryPayload[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const name = form.name.trim();
    const position = form.position.trim();

    if (!name || !position) {
      SweetAlert.errorAlert(
        "Name and position are required"
      );
      return;
    }

    if (
      !Number.isInteger(form.sortOrder) ||
      form.sortOrder < 1
    ) {
      SweetAlert.errorAlert(
        "Display order must be a positive integer"
      );
      return;
    }

    const payload: CreateSignatoryPayload = {
      ...form,
      name,
      position,
    };

    try {
      if (signatory) {
        await updateSignatory({
          id: signatory.id,
          ...payload,
        });
      } else {
        await createSignatory(payload);
      }

      onSuccess?.();
      closeModal();

      SweetAlert.successAlert(
        isEditing
          ? "Signatory updated successfully"
          : "Signatory saved successfully"
      );
    } catch (error) {
      console.error("Signatory save error:", error);

      SweetAlert.errorAlert(
        isEditing
          ? "Failed to update signatory"
          : "Failed to save signatory"
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* NAME */}
        <div>
          <label className={labelClass}>
            Full Name
          </label>

          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              updateField("name", e.target.value)
            }
            placeholder="Enter full name"
            maxLength={100}
            required
            className={inputClass}
          />
        </div>

        {/* POSITION */}
        <div>
          <label className={labelClass}>
            Position
          </label>

          <input
            type="text"
            value={form.position}
            onChange={(e) =>
              updateField("position", e.target.value)
            }
            placeholder="e.g. Payroll Officer"
            maxLength={150}
            required
            className={inputClass}
          />
        </div>

        {/* SIGNATORY TYPE */}
        <div>
          <label className={labelClass}>
            Signatory Type
          </label>

          <select
            value={form.signatory_type}
            onChange={(e) =>
              updateField(
                "signatory_type",
                e.target.value as SignatoryType
              )
            }
            className={inputClass}
          >
            {SIGNATORY_TYPES.map((type) => (
              <option
                key={type.value}
                value={type.value}
              >
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* CATEGORY */}
        <div>
          <label className={labelClass}>
            Report Category
          </label>

          <select
            value={form.category}
            onChange={(e) =>
              updateField(
                "category",
                e.target.value as SignatoryCategory
              )
            }
            className={inputClass}
          >
            {CATEGORIES.map((category) => (
              <option
                key={category.value}
                value={category.value}
              >
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* SORT ORDER */}
        <div>
          <label className={labelClass}>
            Display Order
          </label>

          <input
            type="number"
            min={1}
            step={1}
            value={form.sortOrder}
            onChange={(e) =>
              updateField(
                "sortOrder",
                Number(e.target.value)
              )
            }
            required
            className={inputClass}
          />

          <p className="mt-1 text-xs text-slate-500">
            Controls the order of signatories
            in the printed report.
          </p>
        </div>

        {/* ACTIVE STATUS */}
        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            id="signatory-active"
            checked={form.isActive}
            onChange={(e) =>
              updateField(
                "isActive",
                e.target.checked
              )
            }
            className="h-4 w-4 rounded border-slate-300"
          />

          <label
            htmlFor="signatory-active"
            className="text-sm font-medium text-slate-700"
          >
            Active Signatory
          </label>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end gap-3 border-t pt-5">
        <button
          type="button"
          onClick={closeModal}
          disabled={isPending}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {isPending
            ? "Saving..."
            : isEditing
              ? "Update Signatory"
              : "Save Signatory"}
        </button>
      </div>
    </form>
  );
}

export default function AddSignatory({
  closeModal,
  onSuccess,
}: Omit<SignatoryFormProps, "signatory">) {
  return (
    <SignatoryForm
      closeModal={closeModal}
      onSuccess={onSuccess}
    />
  );
}

export function EditSignatory({
  signatory,
  closeModal,
  onSuccess,
}: SignatoryFormProps & { signatory: Signatory }) {
  return (
    <SignatoryForm
      signatory={signatory}
      closeModal={closeModal}
      onSuccess={onSuccess}
    />
  );
}

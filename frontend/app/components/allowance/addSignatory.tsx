"use client";

import { useState } from "react";
import { useCreateSignatory, useUpdateSignatory } from "@/app/hooks/useAllowance"; 

import type {
  CreateSignatoryPayload,
  Signatory,
  SignatoryType,
  UpdateSignatoryPayload,
} from "@/app/types/allowanceType";
import SweetAlert from "../Swal";

interface AddSignatoryProps {
  onSuccess?: () => void;
  closeModal: () => void;
}

export default function AddSignatory({onSuccess,closeModal}: AddSignatoryProps) {
  const { mutateAsync: createSignatory, isPending } =
    useCreateSignatory();

  const [form, setForm] =
    useState<CreateSignatoryPayload>({
      name: "",
      signatory_type: "PREPARED_BY",
      category: "",
    });

  function handleNameChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm((previous) => ({
      ...previous,
      name: event.target.value,
    }));
  }

  function handleSignatoryTypeChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    setForm((previous) => ({
      ...previous,
      signatory_type: event.target.value as SignatoryType,
    }));
  }

  function handleCategoryChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm((previous) => ({
      ...previous,
      category: event.target.value,
    }));
  }

async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (!form.name.trim()) {
    return;
  }

  await createSignatory({
    name: form.name.trim(),
    signatory_type: form.signatory_type,
    category: form.category.trim(),
  });

  onSuccess?.();

  setForm({
    name: "",
    signatory_type: "PREPARED_BY",
    category: "",
  });

  closeModal();

  SweetAlert.successAlert("Saved successfully");
}

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-3 gap-x-4">
        {/* NAME */}
        <div className="flex flex-col gap-y-2">
          <label htmlFor="signatory-name">
            NAME
          </label>

          <input
            id="signatory-name"
            type="text"
            value={form.name}
            onChange={handleNameChange}
            className="border border-gray-400 rounded py-2.5 px-4"
            placeholder="Enter name"
            required
          />
        </div>

        {/* TYPE */}
        <div className="flex flex-col gap-y-2">
          <label htmlFor="signatory-type">
            SIGNATORY TYPE
          </label>

          <select
            id="signatory-type"
            value={form.signatory_type}
            onChange={handleSignatoryTypeChange}
            className="border border-gray-400 rounded py-2.5 px-4"
          >
            <option value="PREPARED_BY">
              PREPARED BY
            </option>

            <option value="CHECKED_BY">
              CHECKED BY
            </option>

            <option value="NOTED_BY">
              NOTED BY
            </option>
          </select>
        </div>

        {/* CATEGORY */}
        <div className="flex flex-col gap-y-2">
          <label htmlFor="signatory-category">
            CATEGORY
          </label>

          <input
            id="signatory-category"
            type="text"
            value={form.category}
            onChange={handleCategoryChange}
            className="border border-gray-400 rounded py-2.5 px-4"
            placeholder="Enter category"
          />
        </div>
      </div>

      <div className="py-2 mt-4 flex justify-end w-full">
        <button
          type="submit"
          disabled={isPending}
          className="
            bg-blue-700
            text-white
            px-4
            py-2.5
            rounded
            shadow
            hover:bg-blue-500
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}













interface EditSignatoryProps {
  signatory: Signatory;
  closeModal: () => void;
  onSuccess?: () => void;
}

export function EditSignatory({
  signatory,
  closeModal,
  onSuccess,
}: EditSignatoryProps) {
  const {
    mutateAsync: updateSignatory,
    isPending,
  } = useUpdateSignatory();

  const [form, setForm] = useState<UpdateSignatoryPayload>({
    id: signatory.id,
    name: signatory.name ?? "",
    signatory_type: signatory.signatory_type,
    category: signatory.category ?? "",
  });

  function handleNameChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm((previous) => ({
      ...previous,
      name: event.target.value,
    }));
  }

  function handleSignatoryTypeChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    setForm((previous) => ({
      ...previous,
      signatory_type: event.target.value as SignatoryType,
    }));
  }

  function handleCategoryChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm((previous) => ({
      ...previous,
      category: event.target.value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    try {
      await updateSignatory({
        id: form.id,
        name: form.name.trim(),
        signatory_type: form.signatory_type,
        category: form.category.trim(),
      });

      onSuccess?.();

      closeModal();

      SweetAlert.successAlert(
        "Signatory updated successfully"
      );
    } catch {
      SweetAlert.errorAlert(
        "Failed to update signatory"
      );
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-3 gap-x-4">
          <div className="flex flex-col gap-y-2">
            <label htmlFor="signatory-name">
              NAME
            </label>

            <input
              id="signatory-name"
              type="text"
              value={form.name}
              onChange={handleNameChange}
              className="border border-gray-400 rounded py-2.5 px-4"
              placeholder="Enter name"
              required
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label htmlFor="signatory-type">
              SIGNATORY TYPE
            </label>

            <select
              id="signatory-type"
              value={form.signatory_type}
              onChange={handleSignatoryTypeChange}
              className="border border-gray-400 rounded py-2.5 px-4"
            >
              <option value="PREPARED_BY">
                PREPARED BY
              </option>

              <option value="CHECKED_BY">
                CHECKED BY
              </option>

              <option value="NOTED_BY">
                NOTED BY
              </option>
            </select>
          </div>

          <div className="flex flex-col gap-y-2">
            <label htmlFor="signatory-category">
              CATEGORY
            </label>

            <input
              id="signatory-category"
              type="text"
              value={form.category}
              onChange={handleCategoryChange}
              className="border border-gray-400 rounded py-2.5 px-4"
              placeholder="Enter category"
            />
          </div>
        </div>

        <div className="py-2 mt-4 flex justify-end w-full">
          <button
            type="submit"
            disabled={isPending}
            className="
              bg-blue-700
              text-white
              px-4
              py-2.5
              rounded
              shadow
              hover:bg-blue-500
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {isPending ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
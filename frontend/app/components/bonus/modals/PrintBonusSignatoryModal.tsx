
"use client";

import { BonusSignatories, SignatoryPerson } from "@/app/types/bonusType";
import { useEffect, useState } from "react";



type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: BonusSignatories) => void;
  initialValues?: BonusSignatories;
};

const emptyPerson = (): SignatoryPerson=> ({
  name: "",
  position: "",
});

const defaultSignatories = (): BonusSignatories => ({
  preparedBy: emptyPerson(),
  checkedBy: [emptyPerson()],
  approvedBy: emptyPerson(),
});

export default function PrintBonusSignatoryModal({
  open,
  onClose,
  onConfirm,
  initialValues,
}: Props) {
  const [signatories, setSignatories] =
    useState<BonusSignatories>(
      initialValues ?? defaultSignatories()
    );

  useEffect(() => {
    if (open) {
      setSignatories(
        initialValues ?? defaultSignatories()
      );
    }
  }, [open, initialValues]);

  const updatePreparedBy = (
    field: keyof SignatoryPerson,
    value: string
  ) => {
    setSignatories((prev) => ({
      ...prev,
      preparedBy: {
        ...prev.preparedBy,
        [field]: value,
      },
    }));
  };

  const updateApprovedBy = (
    field: keyof SignatoryPerson,
    value: string
  ) => {
    setSignatories((prev) => ({
      ...prev,
      approvedBy: {
        ...prev.approvedBy,
        [field]: value,
      },
    }));
  };

  const updateCheckedBy = (
    index: number,
    field: keyof SignatoryPerson,
    value: string
  ) => {
    setSignatories((prev) => ({
      ...prev,
      checkedBy: prev.checkedBy.map((person, i) =>
        i === index
          ? { ...person, [field]: value }
          : person
      ),
    }));
  };

  const addCheckedBy = () => {
    setSignatories((prev) => {
      if (prev.checkedBy.length >= 3) {
        return prev;
      }

      return {
        ...prev,
        checkedBy: [
          ...prev.checkedBy,
          emptyPerson(),
        ],
      };
    });
  };

  const removeCheckedBy = (index: number) => {
    setSignatories((prev) => ({
      ...prev,
      checkedBy: prev.checkedBy.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleaned: BonusSignatories = {
      preparedBy: {
        name: signatories.preparedBy.name.trim(),
        position: signatories.preparedBy.position.trim(),
      },
      checkedBy: signatories.checkedBy
        .map((person) => ({
          name: person.name.trim(),
          position: person.position.trim(),
        }))
        .filter(
          (person) =>
            person.name || person.position
        ),
      approvedBy: {
        name: signatories.approvedBy.name.trim(),
        position: signatories.approvedBy.position.trim(),
      },
    };

    if (
      !cleaned.preparedBy.name ||
      !cleaned.preparedBy.position ||
      !cleaned.approvedBy.name ||
      !cleaned.approvedBy.position ||
      cleaned.checkedBy.length === 0 ||
      cleaned.checkedBy.length > 3 ||
      cleaned.checkedBy.some(
        (person) => !person.name || !person.position
      )
    ) {
      return;
    }

    onConfirm(cleaned);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Print Bonus Report
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the names and positions of the
            report signatories.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* PREPARED BY */}
          <section className="space-y-3">
            <h3 className="font-semibold text-gray-900">
              Prepared By
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                required
                value={signatories.preparedBy.name}
                onChange={(e) =>
                  updatePreparedBy(
                    "name",
                    e.target.value
                  )
                }
                placeholder="Full Name"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              />

              <input
                required
                value={signatories.preparedBy.position}
                onChange={(e) =>
                  updatePreparedBy(
                    "position",
                    e.target.value
                  )
                }
                placeholder="Position"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              />
            </div>
          </section>

          <div className="border-t" />

          {/* CHECKED BY */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Checked By
                </h3>

                <p className="text-xs text-gray-500">
                  Maximum of 3 persons
                </p>
              </div>

              <button
                type="button"
                onClick={addCheckedBy}
                disabled={
                  signatories.checkedBy.length >= 3
                }
                className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Add Person
              </button>
            </div>

            {signatories.checkedBy.map(
              (person, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Person {index + 1}
                    </span>

                    {signatories.checkedBy.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeCheckedBy(index)
                        }
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      required
                      value={person.name}
                      onChange={(e) =>
                        updateCheckedBy(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Full Name"
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                    />

                    <input
                      required
                      value={person.position}
                      onChange={(e) =>
                        updateCheckedBy(
                          index,
                          "position",
                          e.target.value
                        )
                      }
                      placeholder="Position"
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                    />
                  </div>
                </div>
              )
            )}
          </section>

          <div className="border-t" />

          {/* APPROVED BY */}
          <section className="space-y-3">
            <h3 className="font-semibold text-gray-900">
              Approved By
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                required
                value={signatories.approvedBy.name}
                onChange={(e) =>
                  updateApprovedBy(
                    "name",
                    e.target.value
                  )
                }
                placeholder="Full Name"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              />

              <input
                required
                value={signatories.approvedBy.position}
                onChange={(e) =>
                  updateApprovedBy(
                    "position",
                    e.target.value
                  )
                }
                placeholder="Position"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              />
            </div>
          </section>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Confirm & Print
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

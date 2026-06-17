"use client";

import { createAlertSchema, CreateAlertSchema } from "@/app/schema/alert.schema";
import { useEffect, useState } from "react";
import ToggleSwitch from "../../buttons/ToggleSwitch";
import { useAlertConfiguration, useCreateAlert } from "@/app/hooks/useAlert";

export default function AlertConfigurationModal() {
  const createAlert = useCreateAlert();
  const { data, isLoading } = useAlertConfiguration();
  const [form, setForm] = useState<CreateAlertSchema>({
    isEmail: false,
    email: null,
    isSms: false,
    phoneNumber: null,
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (data?.data) {
      setForm({
        isSms: data.data.isSms,
        phoneNumber: data.data.phoneNumber,
        isEmail: data.data.isEmail,
        email: data.data.email,
      });
    }
  }, [data]);

  function handleChange<K extends keyof CreateAlertSchema>(
    key: K,
    value: CreateAlertSchema[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleEmailToggle(checked: boolean) {
    setForm((prev) => ({
      ...prev,
      isEmail: checked,
    }));
  }
  
  function handleSmsToggle(checked: boolean) {
    setForm((prev) => ({
      ...prev,
      isSms: checked,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const parsed = createAlertSchema.safeParse(form);

    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setErrors({});

    createAlert.mutate(parsed.data, {
      onSuccess: () => {
        alert("Alert configuration saved successfully");
      },
      onError: (error) => {
        console.error(error);
        alert("Failed to save alert configuration");
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl rounded-xl border bg-white p-6 shadow-sm"
    >
      <h2 className="mb-6 text-lg font-semibold">Alert Configuration</h2>

      <div className="space-y-6">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Alert</h3>
              <p className="text-sm text-gray-500">
                Enable email notification
              </p>
            </div>

            <ToggleSwitch
              checked={form.isEmail}
              onChange={handleEmailToggle}
            />
          </div>

          {form.isEmail && (
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">
                Email Address
              </label>

              <input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-md border px-3 py-2 outline-none focus:border-blue-500"
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email[0]}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">SMS Alert</h3>
              <p className="text-sm text-gray-500">
                Enable SMS notification
              </p>
            </div>

            <ToggleSwitch
              checked={form.isSms}
              onChange={handleSmsToggle}
            />
          </div>

          {form.isSms && (
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">
                Phone Number
              </label>

              <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.phoneNumber ?? ""}
                    maxLength={11}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");

                        handleChange("phoneNumber", value);
                    }}
                    placeholder="09123456789"
                    className="w-full rounded-md border px-3 py-2 outline-none focus:border-blue-500"
                    />

              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.phoneNumber[0]}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="rounded-md border px-4 py-2 text-sm">
          Cancel
        </button>

        <button
          type="submit"
          disabled={createAlert.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {createAlert.isPending ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </form>
  );
}
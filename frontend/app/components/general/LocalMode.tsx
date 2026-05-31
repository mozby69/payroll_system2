"use client";

import { useState } from "react";

import {
  useGetLocalMode,
  useUpdateLocalMode,
} from "@/app/hooks/useGeneral";

import SweetAlert from "../Swal";

export default function LocalModePage() {

  const {
    data: localModeData,
  } = useGetLocalMode();

  const {
    mutate,
    isPending,
  } = useUpdateLocalMode();

  const [optimisticMode, setOptimisticMode] =
    useState<boolean | null>(null);

  const dbMode =
    localModeData?.data?.local_mode ?? false;

  const isLocalMode =
    optimisticMode ?? dbMode;

  const handleToggle = () => {

    const nextValue = !isLocalMode;

    // optimistic update
    setOptimisticMode(nextValue);

    mutate(nextValue, {

      onSuccess: () => {

        SweetAlert.successAlert(
          "Mode updated successfully"
        );

        // clear optimistic state
        setOptimisticMode(null);

      },

      onError: () => {

        SweetAlert.errorAlert(
          "Failed to update mode"
        );

        // rollback
        setOptimisticMode(null);

      },

    });

  };

  return (

    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-lg font-semibold text-gray-800">
            Local Data Mode
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Toggle between localhost mode and production mode.
          </p>

        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 ${
            isLocalMode
              ? "bg-green-500"
              : "bg-gray-300"
          }`}
        >

          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              isLocalMode
                ? "translate-x-9"
                : "translate-x-1"
            }`}
          />

          <span
            className={`absolute left-2 text-[10px] font-semibold text-white transition-opacity ${
              isLocalMode
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
            ON
          </span>

          <span
            className={`absolute right-2 text-[10px] font-semibold text-gray-700 transition-opacity ${
              !isLocalMode
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
            OFF
          </span>

        </button>

      </div>

      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">

        <span className="font-medium text-gray-700">
          Current Mode:
        </span>{" "}

        <span
          className={`font-semibold ${
            isLocalMode
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {isLocalMode
            ? "LOCALHOST MODE"
            : "PRODUCTION MODE"}
        </span>

      </div>

    </div>

  );

}
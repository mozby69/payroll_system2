"use client";

import { useEffect, useCallback } from "react";
import { Save, X } from "lucide-react";
import SweetAlert from "./Swal";

type SideModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;


  onSave?: () => void;
  isSaveDisabled?: boolean;
  isDirty?: boolean; 
  onReset?: () => void; 
};

export default function SideModalLayout({
  open,
  onClose,
  title,
  children,
  onSave,
  isSaveDisabled,
  isDirty,
  onReset
}: SideModalProps) {

  
  const handleAttemptClose = useCallback(() => {
    if (!isDirty) {
      onClose();
      return;
    }

    SweetAlert.confirmationAlert(
      "Unsaved Changes",
      "You have unsaved changes. Do you want to save before closing?",
      async () => {
        if (onSave) {
          await onSave();
        }
        onClose();
      },
      () => {
        if (onReset) {
          onReset();
        }
      }
    );
  }, [isDirty, onClose, onSave, onReset]);

  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleAttemptClose();
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [open, handleAttemptClose]);





  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={handleAttemptClose}

      />

      <div
        className="absolute top-0 right-0 h-full w-[40%] bg-mainLight shadow-2xl
        transform transition-transform duration-300 ease-in-out translate-x-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col gap-2">
            <div className="flex justify-between items-center px-6 py-4 bg-mainBg text-mainLight">
                <h2 className="font-bold text-lg">{title}</h2>
                <button onClick={handleAttemptClose} className="cursor-pointer hover:scale-[1.2] hover:text-mainhighlight transition duration-75 ease-in-out">
                <X />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
                {children}
            </div>

            <div className="flex justify-end items-center px-8 py-4  text-mainLight">
               <button
                  onClick={onSave}
                  disabled={isSaveDisabled}
                  className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm transition duration-75 ease-in-out
                    ${isSaveDisabled
                      ? "bg-mainLightGray cursor-not-allowed"
                      : "bg-mainhighlight hover:scale-[1.02] cursor-pointer"
                    }`}
                >
                  <Save /> Save Changes
                </button>

            </div>
        </div>
      </div>
    </div>
  );
}

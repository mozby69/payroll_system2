import { useState } from "react";
import GenButton from "../Buttons";

interface AuthenticationModal {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export default function PasswordModal({
  isOpen,
  onClose,
  onConfirm
}: AuthenticationModal) {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-mainLight p-4 rounded shadow w-80">
        <h2 className="text-lg font-semibold mb-2">Enter Authenticate Password</h2>

        <input
          type="password"
          className="w-full border px-2 py-1 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <GenButton variant="secondary" onClick={onClose}>
            Cancel
            </GenButton>
          <GenButton variant="main"
          onClick={() => {
              onConfirm(password);
              setPassword("");
            }}>
                Confirm
          </GenButton>
        </div>
      </div>
    </div>
  );
}
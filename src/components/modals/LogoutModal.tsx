import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsLoggingOut(false);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await onConfirm();
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md rounded-sm border border-zinc-500 bg-zinc-800 px-6 pt-2 pb-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-10 gap-3 items-center justify-start ">
          <LogOut className="h-7 w-auto text-brick-signal" />
          <h3 className="text-base uppercase font-semibold text-zinc-100">
            Sign out
          </h3>
        </div>
        <div className="h-px bg-zinc-500 mt-2 -mx-6 mb-4" />

        <div className="mt-4">
          <p className="mt-1 text-base text-zinc-200 leading-relaxed">
            Are you sure you want to logout?
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="rounded-sm border border-zinc-500 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoggingOut}
            className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? "Logging out...." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}

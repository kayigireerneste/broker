import { X } from "lucide-react";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "danger";
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideInUp">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-slate-600">{message}</p>
        </div>
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 ${
              confirmVariant === "danger"
                ? "bg-rose-600 hover:bg-rose-700"
                : ""
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

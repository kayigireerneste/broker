"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ type, title, message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
      <div className="pointer-events-auto animate-fadeInUp w-full max-w-lg">
        <div
          className={`w-full ${
            type === "success" ? "bg-white" : "bg-white"
          } shadow-2xl rounded-xl ring-1 ring-black ring-opacity-5 overflow-hidden`}
        >
          <div className="p-6">
            <div className="flex items-start">
              <div className="shrink-0">
                {type === "success" ? (
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-rose-500" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-base font-semibold text-slate-900">{title}</p>
                <p className="mt-2 text-sm text-slate-600">{message}</p>
              </div>
              <div className="ml-4 shrink-0 flex">
                <button
                  onClick={onClose}
                  className="bg-white rounded-md inline-flex text-slate-400 hover:text-slate-500 focus:outline-none transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

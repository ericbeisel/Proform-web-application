"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  showToast: (type: ToastType, message: string, durationMs?: number) => void;
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function styleByType(type: ToastType): string {
  if (type === "success") return "border-[#b7e9d7] bg-[#e8f8f2] text-[#0f7f5c]";
  if (type === "error") return "border-[#f1c8c1] bg-[#fff2f0] text-[#c0392b]";
  return "border-[#bfddfa] bg-[#eaf5ff] text-[#1f6fb2]";
}

function IconByType({ type }: { type: ToastType }) {
  if (type === "success") return <CheckCircle2 size={16} className="shrink-0" />;
  if (type === "error") return <AlertCircle size={16} className="shrink-0" />;
  return <Info size={16} className="shrink-0" />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, message: string, durationMs = 3200) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, durationMs);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (message, durationMs) => showToast("success", message, durationMs),
      error: (message, durationMs) => showToast("error", message, durationMs),
      info: (message, durationMs) => showToast("info", message, durationMs),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[90] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm font-semibold shadow ${styleByType(toast.type)}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <IconByType type={toast.type} />
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

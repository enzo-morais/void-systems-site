"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, X, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = { success: CheckCircle, error: AlertTriangle, info: Info };
  const colors = { success: "#22c55e", error: "#ef4444", info: "#3b82f6" };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg backdrop-blur-xl shadow-2xl min-w-[280px]"
              style={{
                background: "rgba(15,15,15,0.95)",
                border: `1px solid ${colors[t.type]}30`,
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <Icon className="w-4 h-4 shrink-0" style={{ color: colors[t.type] }} />
              <p className="text-sm flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="p-1 cursor-pointer text-silver/30 hover:text-white transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open, title = "Confirmar ação", message, confirmText = "Confirmar",
  cancelText = "Cancelar", danger = true, onConfirm, onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onCancel}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative rounded-lg p-6 max-w-sm w-full mx-4"
        style={{
          background: "rgba(10,10,10,0.9)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          animation: "fadeIn 0.15s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: danger ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)" }}>
            <AlertTriangle className="w-5 h-5" style={{ color: danger ? "#ef4444" : "#fff" }} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-silver/50 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer text-silver/60 hover:text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-xs rounded-lg font-medium transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: danger ? "#ef4444" : "#fff",
              color: danger ? "#fff" : "#000",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

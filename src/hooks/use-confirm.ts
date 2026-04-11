"use client";

import { useState, useCallback } from "react";

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  danger: boolean;
  resolve: ((value: boolean) => void) | null;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    open: false, title: "", message: "", confirmText: "Confirmar", danger: true, resolve: null,
  });

  const confirm = useCallback((opts: { title?: string; message: string; confirmText?: string; danger?: boolean }) => {
    return new Promise<boolean>((resolve) => {
      setState({
        open: true,
        title: opts.title || "Confirmar ação",
        message: opts.message,
        confirmText: opts.confirmText || "Confirmar",
        danger: opts.danger ?? true,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((s) => ({ ...s, open: false, resolve: null }));
  }, [state]);

  return { confirm, modalProps: { ...state, onConfirm: handleConfirm, onCancel: handleCancel } };
}

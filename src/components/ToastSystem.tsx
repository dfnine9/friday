"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Check, Info, AlertTriangle, X, Zap } from "lucide-react";
import clsx from "clsx";

type ToastType = "success" | "info" | "warning" | "error" | "action";
type Toast = { id: number; type: ToastType; title: string; message?: string };

type ToastContextType = {
  toast: (type: ToastType, title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container — bottom right */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto animate-fade-in-up glass-card !rounded-xl px-4 py-3 flex items-start gap-3 min-w-[280px] max-w-[380px] border-l-[3px]"
            style={{ borderLeftColor: TOAST_CONFIG[t.type].color }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: `${TOAST_CONFIG[t.type].color}15`, color: TOAST_CONFIG[t.type].color }}
            >
              {TOAST_CONFIG[t.type].icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-text-primary">{t.title}</div>
              {t.message && <div className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{t.message}</div>}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-text-muted hover:text-text-secondary p-0.5 shrink-0">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const TOAST_CONFIG: Record<ToastType, { color: string; icon: ReactNode }> = {
  success: { color: "#07CA6B", icon: <Check className="w-4 h-4" /> },
  info: { color: "#1856FF", icon: <Info className="w-4 h-4" /> },
  warning: { color: "#E89558", icon: <AlertTriangle className="w-4 h-4" /> },
  error: { color: "#EA2143", icon: <X className="w-4 h-4" /> },
  action: { color: "#7c3aed", icon: <Zap className="w-4 h-4" /> },
};

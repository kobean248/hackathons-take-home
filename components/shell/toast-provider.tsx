"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckIcon, FlagIcon, QuestionIcon } from "@/components/icons";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; type: ToastType; message: string };

const TOAST_DURATION_MS = 4000;

const ToastContext = createContext<{
  push: (type: ToastType, message: string) => void;
} | null>(null);

/** Fire-and-forget toast, wired into mutating actions (save/submit/decide/
 * join/etc.) instead of leaving them as silent inline state changes. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}

const TOAST_STYLES: Record<ToastType, { bg: string; icon: ReactNode }> = {
  success: {
    bg: "border-mint/40 bg-mint/10 text-mint",
    icon: <CheckIcon className="size-4" />,
  },
  error: {
    bg: "border-brick/40 bg-brick/10 text-brick",
    icon: <FlagIcon className="size-4" />,
  },
  info: {
    bg: "border-sky/40 bg-sky/10 text-sky",
    icon: <QuestionIcon className="size-4" />,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback((type: ToastType, message: string) => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  function dismiss(id: number) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const style = TOAST_STYLES[t.type];
          return (
            <div
              key={t.id}
              className={`toast-enter pointer-events-auto relative overflow-hidden rounded-xl border bg-surface px-4 py-3 shadow-[0_8px_24px_rgba(10,14,31,0.12)] ${style.bg}`}
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0">{style.icon}</span>
                <p className="flex-1 text-sm text-ink">{t.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 text-ink-soft hover:text-ink"
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
              <div
                className="toast-progress absolute inset-x-0 bottom-0 h-0.5 bg-current opacity-40"
                style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

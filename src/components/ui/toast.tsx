import * as React from "react";
import { create } from "@/lib/brand-store";
import { CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Info, X, Circle as XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "warning" | "destructive" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastState = {
  toasts: Toast[];
  add: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
};

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (t) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    const duration = t.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
      }, duration);
    }
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

type ToastFn = {
  (t: Omit<Toast, "id">): void;
  success: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
};

export function useToast(): { toast: ToastFn } {
  const add = useToastStore((s) => s.add);
  const toast = ((t: Omit<Toast, "id">) => add(t)) as ToastFn;
  toast.success = (title: string, description?: string) =>
    add({ title, description, variant: "success" });
  toast.warning = (title: string, description?: string) =>
    add({ title, description, variant: "warning" });
  toast.error = (title: string, description?: string) =>
    add({ title, description, variant: "destructive" });
  toast.info = (title: string, description?: string) =>
    add({ title, description, variant: "info" });
  return { toast };
}

const variantConfig: Record<
  ToastVariant,
  { icon: React.ElementType; className: string }
> = {
  default: { icon: Info, className: "text-primary" },
  success: { icon: CheckCircle2, className: "text-success" },
  warning: { icon: AlertCircle, className: "text-warning" },
  destructive: { icon: XCircle, className: "text-destructive" },
  info: { icon: Info, className: "text-chart-5" },
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const { icon: Icon, className } = variantConfig[t.variant ?? "default"];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-elevated data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
            )}
          >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", className)} />
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              {t.description && (
                <p className="text-sm text-muted-foreground">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

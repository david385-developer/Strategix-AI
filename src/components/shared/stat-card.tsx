import * as React from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  chart?: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  chart,
  className,
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("p-5 hover:shadow-card transition-shadow", className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          {delta !== undefined && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold",
                  positive
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(delta)}%
              </span>
              {deltaLabel && (
                <span className="text-xs text-muted-foreground">{deltaLabel}</span>
              )}
            </div>
          )}
          {chart && <div className="h-8 w-24">{chart}</div>}
        </div>
      </Card>
    </motion.div>
  );
}

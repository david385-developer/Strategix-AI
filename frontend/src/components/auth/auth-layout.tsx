import { Link } from "react-router-dom";
import { Sparkles, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthLayout({
  children,
  side = "left",
}: {
  children: React.ReactNode;
  side?: "left" | "right";
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div
        className={cn(
          "relative hidden flex-col justify-between overflow-hidden bg-secondary p-10 text-secondary-foreground lg:flex",
          side === "right" && "order-2"
        )}
      >
        <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-10" />
        <div className="absolute -right-24 top-1/4 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -left-24 bottom-1/4 h-64 w-64 rounded-full bg-chart-4/30 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-secondary-foreground">
            Strategix<span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="relative space-y-8">
          <div>
            <h2 className="font-display text-3xl font-bold leading-tight text-secondary-foreground">
              The intelligent workspace for modern marketing teams
            </h2>
            <p className="mt-3 max-w-md text-secondary-foreground/60">
              Plan campaigns, generate content, collaborate, and measure — all powered by AI.
            </p>
          </div>
          <div className="rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 p-6 backdrop-blur">
            <Quote className="h-6 w-6 text-primary/60" />
            <p className="mt-3 text-sm leading-relaxed text-secondary-foreground/90">
              "Strategix replaced four tools for us. We plan, create, and measure everything from one place — and our output doubled."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-4 text-xs font-semibold text-primary-foreground">
                MT
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-foreground">Maya Thompson</p>
                <p className="text-xs text-secondary-foreground/50">Head of Growth, Lumen</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-secondary-foreground/40">
          © 2025 Strategix AI, Inc. — Trusted by 4,000+ teams
        </p>
      </div>

      {/* Form panel */}
      <div className={cn("flex flex-col justify-center px-6 py-10 sm:px-12", side === "right" && "order-1")}>
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Strategix<span className="text-primary">AI</span>
            </span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}

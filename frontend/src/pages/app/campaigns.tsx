import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, LayoutGrid, List, MoveHorizontal as MoreHorizontal, Eye, Heart, Zap, Users, DollarSign, Filter, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { useCampaigns } from "@/hooks/use-campaigns";
import { campaignStatusConfig, platformIcons } from "@/lib/content-helpers";
import { cn, formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import type { CampaignStatus } from "@/types";

const filters: { label: string; value: CampaignStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Draft", value: "draft" },
  { label: "Completed", value: "completed" },
];

export default function CampaignsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<CampaignStatus | "all">("all");
  const [query, setQuery] = useState("");

  const { campaigns, isLoading } = useCampaigns();

  const filtered = (campaigns || []).filter(
    (c: any) =>
      (filter === "all" || c.status === filter) &&
      c.name.toLowerCase().includes(query.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  const totalCampaigns = campaigns?.length || 0;
  const activeNow = campaigns?.filter((c: any) => c.status === "active").length || 0;
  const totalBudget = campaigns?.reduce((s: number, c: any) => s + c.budget, 0) || 0;
  const totalReach = campaigns?.reduce((s: number, c: any) => s + c.reach, 0) || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Plan, track, and optimize all your marketing campaigns in one place."
        breadcrumbs={[{ label: "Dashboard", href: "/app/dashboard" }, { label: "Campaigns" }]}
        actions={
          <Button asChild>
            <Link to="/app/campaigns/new"><Plus className="h-4 w-4" /> New Campaign</Link>
          </Button>
        }
      />

      {/* Stats summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Campaigns", value: totalCampaigns, icon: Plus, color: "text-primary" },
          { label: "Active Now", value: activeNow, icon: Eye, color: "text-success" },
          { label: "Total Budget", value: formatCurrency(totalBudget), icon: DollarSign, color: "text-warning" },
          { label: "Total Reach", value: formatNumber(totalReach), icon: Users, color: "text-chart-4" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-xl font-bold">{s.value}</p>
              </div>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  filter === f.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-1">
            <button
              onClick={() => setView("grid")}
              className={cn("rounded-md p-1.5", view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("rounded-md p-1.5", view === "list" ? "bg-muted text-foreground" : "text-muted-foreground")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-6 w-6" />}
          title="No campaigns found"
          description="Try adjusting your filters or create your first campaign to get started."
          action={<Button asChild><Link to="/app/campaigns/new"><Plus className="h-4 w-4" /> New Campaign</Link></Button>}
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c: any, i: number) => {
            const cfg = campaignStatusConfig[c.status as CampaignStatus] || { variant: "muted", dot: "bg-muted-foreground", label: c.status };
            return (
              <motion.div
                key={c.id || c._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link to={`/app/campaigns/${c.id || c._id}`}>
                  <Card className="group h-full overflow-hidden transition-all hover:shadow-card hover:-translate-y-0.5">
                    <div className="h-1.5 w-full" style={{ background: c.color }} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2">
                          {c.channel.slice(0, 3).map((ch: string) => {
                            const Icon = platformIcons[ch];
                            return Icon ? (
                              <div key={ch} className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                            ) : null;
                          })}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit campaign</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem>Archive</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <h3 className="font-display text-base font-semibold leading-tight">{c.name}</h3>
                        <Badge variant={cfg.variant} className="shrink-0">
                          <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} /> {cfg.label}
                        </Badge>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{c.goal}</p>
                      <div className="mt-4">
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{c.progress}%</span>
                        </div>
                        <Progress value={c.progress} className="h-1.5" />
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Reach</p>
                          <p className="flex items-center gap-1 text-sm font-semibold"><Eye className="h-3 w-3 text-muted-foreground" />{formatNumber(c.reach)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Engage</p>
                          <p className="flex items-center gap-1 text-sm font-semibold"><Heart className="h-3 w-3 text-muted-foreground" />{c.engagement}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Convert</p>
                          <p className="flex items-center gap-1 text-sm font-semibold"><Zap className="h-3 w-3 text-muted-foreground" />{formatNumber(c.conversions)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(c.startDate)} – {formatDate(c.endDate)}</span>
                        <span className="font-medium text-foreground">{formatCurrency(c.spent)} / {formatCurrency(c.budget)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Campaign</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Channels</th>
                  <th className="px-4 py-3 text-right font-medium">Reach</th>
                  <th className="px-4 py-3 text-right font-medium">Budget</th>
                  <th className="px-4 py-3 text-left font-medium">Progress</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c: any) => {
                  const cfg = campaignStatusConfig[c.status as CampaignStatus] || { variant: "muted", dot: "bg-muted-foreground", label: c.status };
                  return (
                    <tr key={c.id || c._id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link to={`/app/campaigns/${c.id || c._id}`} className="flex items-center gap-3">
                          <div className="h-8 w-1 rounded-full" style={{ background: c.color }} />
                          <div>
                            <p className="font-medium text-foreground">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.ownerId?.name || c.owner?.name || "Sarah Chen"}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={cfg.variant}><span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} /> {cfg.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {c.channel.slice(0, 3).map((ch: string) => {
                            const Icon = platformIcons[ch];
                            return Icon ? <Icon key={ch} className="h-4 w-4 text-muted-foreground" /> : null;
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatNumber(c.reach)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium">{formatCurrency(c.spent)}</span>
                        <span className="text-muted-foreground"> / {formatCurrency(c.budget)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={c.progress} className="h-1.5 w-20" />
                          <span className="text-xs text-muted-foreground">{c.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/app/campaigns/${c.id || c._id}`} className="inline-flex items-center text-primary hover:underline">
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

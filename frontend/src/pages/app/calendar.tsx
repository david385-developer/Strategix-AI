import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, CalendarDays, List, Grid3x3,
  Clock, Filter,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { contentStatusConfig, channelColors, platformIcons } from "@/lib/content-helpers";
import type { ContentStatus } from "@/types";

const statusLegend: { status: ContentStatus; label: string }[] = [
  { status: "scheduled", label: "Scheduled" },
  { status: "draft", label: "Draft" },
  { status: "published", label: "Published" },
  { status: "approval", label: "Approval" },
];

const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

import { useContent } from "@/hooks/use-content";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useToast } from "@/components/ui/toast";

export default function CalendarPage() {
  const { toast } = useToast();
  const [view, setView] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // July 2026

  const [platformFilter, setPlatformFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");

  const { contentItems, isLoading, updateContent } = useContent();
  const { campaigns } = useCampaigns();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);

  const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  
  // Apply frontend filters to the content list
  const filteredContentItems = (contentItems || []).filter((item: any) => {
    const matchesPlatform = platformFilter === "all" || item.platform?.toLowerCase() === platformFilter.toLowerCase() || item.type?.toLowerCase() === platformFilter.toLowerCase();
    const matchesCampaign = campaignFilter === "all" || item.campaignId === campaignFilter || item.campaignId?._id === campaignFilter;
    return matchesPlatform && matchesCampaign;
  });

  const eventsForDay = (d: Date) =>
    filteredContentItems
      .filter((item: any) => item.scheduledFor && dateKey(new Date(item.scheduledFor)) === dateKey(d))
      .map((item: any) => ({
        id: item.id || item._id,
        title: item.title,
        platform: item.platform || item.type,
        status: item.status,
        time: item.scheduledFor ? new Date(item.scheduledFor).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "",
      }));

  const handleDrop = async (evt: React.DragEvent, targetDate: Date) => {
    evt.preventDefault();
    const id = evt.dataTransfer.getData("text/plain");
    if (!id || !targetDate) return;

    const item = (contentItems || []).find((ci: any) => ci.id === id || ci._id === id);
    if (!item) return;

    try {
      const newScheduledDate = new Date(targetDate);
      if (item.scheduledFor) {
        const oldTime = new Date(item.scheduledFor);
        newScheduledDate.setHours(oldTime.getHours(), oldTime.getMinutes(), 0, 0);
      } else {
        newScheduledDate.setHours(10, 0, 0, 0);
      }

      const res = await updateContent({
        id,
        data: {
          scheduledFor: newScheduledDate.toISOString(),
          status: "scheduled",
        },
      });

      if (res?.conflictWarning) {
        toast.warning("Schedule Conflict", "Another post is already scheduled on this platform around this hour.");
      } else {
        toast.success("Scheduled successfully", `Post moved to ${newScheduledDate.toLocaleDateString()}`);
      }
    } catch (err: any) {
      toast.error("Reschedule failed", err.response?.data?.message || "Could not reschedule content.");
    }
  };

  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date(2026, 6, 25);
  const isToday = (d: Date) => dateKey(d) === dateKey(today);

  // Week view
  const weekStart = new Date(2026, 6, 21);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Calendar"
        description="Plan, schedule, and visualize your content across all channels."
        breadcrumbs={[{ label: "Dashboard", href: "/app/dashboard" }, { label: "Calendar" }]}
        actions={
          <Button><Plus className="h-4 w-4" /> Schedule Post</Button>
        }
      />

      {/* Legend + controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {statusLegend.map((l) => {
            const cfg = contentStatusConfig[l.status] || { dot: "bg-muted" };
            return (
              <span key={l.status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn("h-2.5 w-2.5 rounded-full", cfg.dot)} />
                {l.label}
              </span>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Platform filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="email">Email</option>
            <option value="blog">Blog</option>
          </select>

          {/* Campaign filter */}
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:ring-1 focus:ring-primary max-w-[150px] truncate outline-none"
          >
            <option value="all">All Campaigns</option>
            {(campaigns || []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-1">
            <button onClick={() => setView("month")} className={cn("rounded-md p-1.5", view === "month" ? "bg-muted text-foreground" : "text-muted-foreground")}>
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button onClick={() => setView("week")} className={cn("rounded-md p-1.5", view === "week" ? "bg-muted text-foreground" : "text-muted-foreground")}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {view === "month" ? (
        <Card className="overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-lg font-semibold">{monthNames[month]} {year}</h2>
              <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(2026, 6, 25))}>Today</Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon-sm" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {dayNames.map((d) => (
              <div key={d} className="px-2 py-2.5 text-center text-xs font-semibold text-muted-foreground">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              if (!d) return <div key={i} className="min-h-[110px] border-b border-r border-border bg-muted/20" />;
              const dayEvents = eventsForDay(d);
              const todayCls = isToday(d);
              return (
                <div
                  key={i}
                  onDragOver={(evt) => evt.preventDefault()}
                  onDrop={(evt) => handleDrop(evt, d)}
                  className={cn(
                    "group min-h-[110px] border-b border-r border-border p-1.5 transition-colors hover:bg-primary/[0.02]",
                    todayCls && "bg-primary/5 ring-1 ring-inset ring-primary/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                      todayCls ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {d.getDate()}
                    </span>
                    <button className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 3).map((e: any) => {
                      const cfg = contentStatusConfig[e.status as ContentStatus] || { label: e.status, className: "bg-muted text-muted-foreground", dot: "bg-muted" };
                      const Icon = platformIcons[e.platform as keyof typeof platformIcons] || Clock;
                      const color = channelColors[e.platform as keyof typeof channelColors] || "hsl(243 75% 59%)";
                      return (
                        <div
                          key={e.id}
                          draggable
                          onDragStart={(evt) => evt.dataTransfer.setData("text/plain", e.id)}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="cursor-grab active:cursor-grabbing rounded-md px-1.5 py-1 text-left text-xs transition-all hover:shadow-soft"
                            style={{ background: `${color}15`, borderLeft: `2px solid ${color}` }}
                          >
                            <div className="flex items-center gap-1">
                              {Icon && <Icon className="h-3 w-3 shrink-0" style={{ color }} />}
                              <span className="truncate font-medium text-foreground">{e.title}</span>
                            </div>
                            {e.time && <span className="text-[10px] text-muted-foreground">{e.time}</span>}
                          </motion.div>
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <p className="px-1.5 text-[10px] font-medium text-primary">+{dayEvents.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Week of {monthNames[weekStart.getMonth()]} {weekStart.getDate()}</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon-sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="grid grid-cols-7 divide-x divide-border">
            {weekDays.map((d, i) => {
              const dayEvents = eventsForDay(d);
              return (
                <div key={i} className="min-h-[400px] p-3">
                  <div className="mb-3 text-center">
                    <p className="text-xs font-semibold text-muted-foreground">{dayNames[d.getDay()]}</p>
                    <p className={cn("mt-1 font-display text-xl font-bold", isToday(d) ? "text-primary" : "text-foreground")}>{d.getDate()}</p>
                  </div>
                  <div className="space-y-2">
                    {dayEvents.map((e: any) => {
                      const cfg = contentStatusConfig[e.status as ContentStatus] || { label: e.status, className: "bg-muted text-muted-foreground", dot: "bg-muted" };
                      const Icon = platformIcons[e.platform as keyof typeof platformIcons] || Clock;
                      return (
                        <motion.div
                          key={e.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="cursor-pointer rounded-lg border border-border bg-card p-2.5 transition-all hover:shadow-soft"
                        >
                          <div className="flex items-center justify-between">
                            {Icon && <Icon className="h-3.5 w-3.5" style={{ color: channelColors[e.platform as keyof typeof channelColors] || "hsl(243 75% 59%)" }} />}
                            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                          </div>
                          <p className="mt-1.5 text-xs font-medium text-foreground">{e.title}</p>
                          {e.time && <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-2.5 w-2.5" /> {e.time}</p>}
                          <Badge className={cn("mt-1.5 border-0 text-[10px]", cfg.className)}>{cfg.label}</Badge>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Upcoming list */}
      <Card>
        <CardContent className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" /> Upcoming this week
          </h3>
          <div className="space-y-2">
            {(filteredContentItems || []).slice(0, 5).map((e: any) => {
              const cfg = contentStatusConfig[e.status as ContentStatus] || { label: e.status, className: "bg-muted text-muted-foreground", dot: "bg-muted" };
              const Icon = platformIcons[e.type as keyof typeof platformIcons] || platformIcons[e.platform as keyof typeof platformIcons] || Clock;
              const dateStr = e.scheduledFor ? new Date(e.scheduledFor).toLocaleDateString() : "Draft";
              return (
                <div key={e.id || e._id} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30">
                  {Icon && <Icon className="h-4 w-4 shrink-0" style={{ color: channelColors[e.type as keyof typeof channelColors] || channelColors[e.platform as keyof typeof channelColors] || "hsl(243 75% 59%)" }} />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{dateStr}</p>
                  </div>
                  <Badge className={cn("border-0", cfg.className)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} /> {cfg.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

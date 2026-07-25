import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Settings as SettingsIcon, CircleCheck as CheckCircle2, Sparkles, MessageSquare, Send, AtSign, Bot, Info, Check } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const iconMap = {
  approval: CheckCircle2,
  mention: AtSign,
  published: Send,
  ai: Bot,
  comment: MessageSquare,
  system: Info,
};

const iconColor = {
  approval: "bg-warning/10 text-warning",
  mention: "bg-primary/10 text-primary",
  published: "bg-success/10 text-success",
  ai: "bg-chart-4/10 text-chart-4",
  comment: "bg-chart-5/10 text-chart-5",
  system: "bg-muted text-muted-foreground",
};

const groupLabels = { today: "Today", yesterday: "Yesterday", "this-week": "This Week" };

import { useNotifications } from "@/hooks/use-notifications";

export default function NotificationsPage() {
  const { toast } = useToast();
  const { notifications: dbNotifications, isLoading, markRead, markAllRead } = useNotifications();

  const getGroup = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return "today";
    if (diffDays <= 2) return "yesterday";
    return "this-week";
  };

  const items = (dbNotifications || []).map((n: any) => ({
    ...n,
    id: n.id || n._id,
    group: n.group || getGroup(n.createdAt || new Date()),
    time: n.time || new Date(n.createdAt || new Date()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  }));

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = filter === "unread" ? items.filter((n: any) => !n.read) : items;
  const unreadCount = items.filter((n: any) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      toast.success("All caught up!", "Marked all notifications as read.");
    } catch (err) {
      toast.error("Failed to mark all read");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id);
    } catch (err) {
      // fail silently
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay on top of approvals, mentions, and activity across your workspace."
        breadcrumbs={[{ label: "Dashboard", href: "/app/dashboard" }, { label: "Notifications" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
            <Button variant="outline" size="sm"><SettingsIcon className="h-4 w-4" /> Preferences</Button>
          </>
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          All ({items.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", filter === "unread" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Groups */}
      {(["today", "yesterday", "this-week"] as const).map((group) => {
        const groupItems = filtered.filter((n: any) => n.group === group);
        if (groupItems.length === 0) return null;
        return (
          <div key={group} className="space-y-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{groupLabels[group]}</p>
            <div className="space-y-2">
              {groupItems.map((n: any, i: number) => {
                const Icon = iconMap[n.icon as keyof typeof iconMap] || Info;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card
                      className={cn("cursor-pointer transition-all hover:shadow-soft", !n.read && "border-primary/30 bg-primary/[0.02]")}
                      onClick={() => handleMarkRead(n.id)}
                    >
                      <CardContent className="flex items-start gap-3 p-4">
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconColor[n.icon as keyof typeof iconColor] || "bg-muted text-muted-foreground")}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{n.title}</p>
                            {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">{n.description}</p>
                          <p className="mt-1.5 text-xs text-muted-foreground">{n.time}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          {n.icon === "approval" && <Button size="sm" variant="success" className="h-7 text-xs"><Check className="h-3 w-3" /> Approve</Button>}
                          {n.icon === "ai" && <Button size="sm" variant="outline" className="h-7 text-xs"><Sparkles className="h-3 w-3" /> View</Button>}
                          {n.icon === "comment" && <Button size="sm" variant="outline" className="h-7 text-xs">Reply</Button>}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
              <Bell className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">You're all caught up!</p>
            <p className="mt-1 text-xs text-muted-foreground">New notifications will appear here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

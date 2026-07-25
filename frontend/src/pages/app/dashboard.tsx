import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Megaphone, CalendarClock, TrendingUp, Activity, Rocket, ArrowRight, CircleCheck as CheckCircle2, Clock, Eye, Heart, MessageCircle, Share2, Zap, Plus, ChartBar as BarChart3, SquarePen as PenSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkline } from "@/components/shared/sparkline";
import { useDashboard } from "@/hooks/use-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { campaignStatusConfig, contentStatusConfig } from "@/lib/content-helpers";
import { cn, formatNumber, formatCurrency, relativeTime } from "@/lib/utils";
import type { CampaignStatus, ContentStatus } from "@/types";

const sparkData = [20, 35, 28, 45, 38, 52, 48, 60, 55, 68, 72, 80];

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalReach: 496000,
    avgEngagement: 6.2,
    conversions: 3072,
    budgetUsed: 17600,
    reachDelta: 12.4,
    engagementDelta: 3.1,
    conversionsDelta: 8.7,
    budgetDelta: -2.3
  };

  const activeCampaigns = data?.activeCampaigns || [];
  const upcomingPosts = data?.upcomingContent || [];
  const pendingApprovals = upcomingPosts.filter((c: any) => c.status === "approval");
  const activities = data?.activities || [];
  const tasks = data?.tasks || [];
  const recommendations = data?.recommendations || [];

  const welcomeName = user?.name ? user.name.split(" ")[0] : "Sarah";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good morning, ${welcomeName}`}
        description="Here's what's happening across your marketing today."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/analytics"><BarChart3 className="h-4 w-4" /> Analytics</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/app/content-studio"><PenSquare className="h-4 w-4" /> Create content</Link>
            </Button>
          </>
        }
      />

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
          <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-10" />
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <CardContent className="relative flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <Badge className="bg-white/20 text-primary-foreground border-0">
                <Sparkles className="h-3 w-3" /> AI Insight
              </Badge>
              <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                Your Summer Launch is outperforming by 23%
              </h2>
              <p className="max-w-xl text-sm text-primary-foreground/80">
                Engagement on Instagram is driving most conversions. Consider reallocating 15% of your
                email budget to paid social this week.
              </p>
            </div>
            <Button variant="secondary" size="sm" className="shrink-0" asChild>
              <Link to="/app/analytics">
                View insights <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Reach"
          value={formatNumber(stats.totalReach)}
          delta={stats.reachDelta}
          deltaLabel="vs last week"
          icon={<Eye className="h-5 w-5" />}
          chart={<Sparkline data={sparkData} color="hsl(243 75% 59%)" />}
        />
        <StatCard
          label="Engagement Rate"
          value={`${stats.avgEngagement}%`}
          delta={stats.engagementDelta}
          deltaLabel="vs last week"
          icon={<Heart className="h-5 w-5" />}
          chart={<Sparkline data={[3, 4, 3.5, 5, 4.5, 6, 5.5, 6.2]} color="hsl(158 64% 52%)" />}
        />
        <StatCard
          label="Conversions"
          value={formatNumber(stats.conversions)}
          delta={stats.conversionsDelta}
          deltaLabel="vs last week"
          icon={<Zap className="h-5 w-5" />}
          chart={<Sparkline data={[10, 22, 18, 30, 25, 35, 40, 48]} color="hsl(38 92% 50%)" />}
        />
        <StatCard
          label="Budget Used"
          value={formatCurrency(stats.budgetUsed)}
          delta={stats.budgetDelta}
          deltaLabel="under pace"
          icon={<TrendingUp className="h-5 w-5" />}
          chart={<Sparkline data={[5, 10, 15, 22, 30, 38, 45, 52]} color="hsl(262 83% 58%)" />}
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current campaigns */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Current campaigns</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/campaigns">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeCampaigns.slice(0, 3).map((c: any) => {
              const cfg = campaignStatusConfig[c.status as CampaignStatus] || { variant: "muted", dot: "bg-muted-foreground", label: c.status };
              return (
                <Link
                  key={c.id || c._id}
                  to={`/app/campaigns/${c.id || c._id}`}
                  className="flex items-center gap-4 rounded-xl border border-border p-4 transition-all hover:border-primary/30 hover:shadow-soft"
                >
                  <div className="h-10 w-1 rounded-full" style={{ background: c.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-foreground">{c.name}</p>
                      <Badge variant={cfg.variant} className="shrink-0">
                        <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} /> {cfg.label}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(c.reach)}</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {c.engagement}%</span>
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {formatNumber(c.conversions)}</span>
                    </div>
                  </div>
                  <div className="hidden w-28 shrink-0 sm:block">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-1.5" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">AI Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((r: any, i: number) => {
              const Icon = i === 0 ? TrendingUp : i === 1 ? PenSquare : Activity;
              return (
                <div key={i} className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted/40">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm text-foreground">{r.text}</p>
                </div>
              );
            })}
            <Button variant="subtle" size="sm" className="w-full" asChild>
              <Link to="/app/ai-assistant">Open AI Assistant <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Second row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming posts */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Upcoming posts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/calendar">Calendar <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {upcomingPosts.map((item: any) => {
              const cfg = contentStatusConfig[item.status as ContentStatus] || { className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground", label: item.status };
              return (
                <div
                  key={item.id || item._id}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <PenSquare className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.platform} · {item.campaign}</p>
                  </div>
                  {item.scheduledFor && (
                    <div className="hidden text-right sm:block">
                      <p className="text-xs font-medium text-foreground">
                        {new Date(item.scheduledFor).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.scheduledFor).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                  )}
                  <Badge variant="muted" className={cn("shrink-0", cfg.className)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} /> {cfg.label}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5">
            {[
              { icon: Megaphone, label: "New Campaign", to: "/app/campaigns/new", color: "bg-primary/10 text-primary" },
              { icon: PenSquare, label: "Create Content", to: "/app/content-studio", color: "bg-chart-2/10 text-chart-2" },
              { icon: Sparkles, label: "Ask AI", to: "/app/ai-assistant", color: "bg-chart-4/10 text-chart-4" },
              { icon: CalendarClock, label: "Schedule Post", to: "/app/calendar", color: "bg-warning/10 text-warning" },
              { icon: BarChart3, label: "View Reports", to: "/app/analytics", color: "bg-chart-5/10 text-chart-5" },
              { icon: Plus, label: "Invite Member", to: "/app/team", color: "bg-success/10 text-success" },
            ].map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="group flex flex-col gap-2 rounded-xl border border-border p-3.5 transition-all hover:border-primary/30 hover:shadow-soft"
              >
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", a.color)}>
                  <a.icon className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-foreground">{a.label}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Third row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Content waiting approval */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Waiting approval</CardTitle>
            <Badge variant="warning">{pendingApprovals.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
             {pendingApprovals.map((item: any) => (
              <div key={item.id || item._id} className="rounded-xl border border-border p-3">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.platform}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="success" className="h-7 flex-1 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 flex-1 text-xs">
                    <MessageCircle className="h-3.5 w-3.5" /> Comment
                  </Button>
                </div>
              </div>
            ))}
            {pendingApprovals.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">All caught up!</p>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/team">Team <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {activities.slice(0, 6).map((a: any) => (
              <div key={a.id || a._id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/40">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={cn(a.user === "AI Assistant" ? "bg-gradient-to-br from-primary to-chart-4 text-primary-foreground" : "bg-primary/10 text-primary", "text-[10px]")}>
                    {a.initials}
                  </AvatarFallback>
                </Avatar>
                <p className="flex-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{a.user}</span> {a.action}{" "}
                  <span className="font-medium text-foreground">{a.target}</span>
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(a.time)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance snapshot + marketing health */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Performance snapshot</CardTitle>
            <Badge variant="muted">Last 12 weeks</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Reach", value: "496K", icon: Eye, color: "text-primary", change: "+12%" },
                { label: "Engagement", value: "6.2%", icon: Heart, color: "text-chart-2", change: "+3%" },
                { label: "Conversions", value: "3,072", icon: Zap, color: "text-warning", change: "+9%" },
                { label: "Shares", value: "1.2K", icon: Share2, color: "text-chart-4", change: "+5%" },
              ].map((s) => (
                <div key={s.label} className="space-y-2">
                  <s.icon className={cn("h-4 w-4", s.color)} />
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={cn("text-xs font-semibold", s.color)}>{s.change}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 h-32">
              <Sparkline data={sparkData} color="hsl(243 75% 59%)" height={128} />
            </div>
          </CardContent>
        </Card>

        {/* Marketing health score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Marketing health score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="hsl(158 64% 52%)" strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - 0.78)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute text-center">
                <p className="font-display text-4xl font-bold">78</p>
                <p className="text-xs text-muted-foreground">out of 100</p>
              </div>
            </div>
            <div className="mt-5 w-full space-y-2">
              {[
                { label: "Consistency", value: 85, color: "bg-success" },
                { label: "Engagement", value: 72, color: "bg-primary" },
                { label: "Conversion", value: 68, color: "bg-warning" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium">{m.value}%</span>
                  </div>
                  <Progress value={m.value} indicatorClassName={m.color} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Heart, Zap, DollarSign, Calendar, Target, Users, TrendingUp, Sparkles, MoveHorizontal as MoreHorizontal, CreditCard as Edit, Copy, Pause, Play, CircleCheck as CheckCircle2, Clock, Image as ImageIcon, MessageCircle, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Cell, PieChart, Pie,
} from "recharts";
import { useCampaign } from "@/hooks/use-campaigns";
import { useContent } from "@/hooks/use-content";
import { campaignStatusConfig, platformIcons, contentStatusConfig } from "@/lib/content-helpers";
import { cn, formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import type { CampaignStatus, ContentStatus } from "@/types";

const performanceData = [
  { week: "W1", reach: 32000, engagement: 2400, conversions: 180 },
  { week: "W2", reach: 48000, engagement: 3600, conversions: 290 },
  { week: "W3", reach: 56000, engagement: 4100, conversions: 340 },
  { week: "W4", reach: 61000, engagement: 4800, conversions: 410 },
  { week: "W5", reach: 51000, engagement: 3900, conversions: 320 },
  { week: "W6", reach: 58000, engagement: 4500, conversions: 380 },
];

const channelSplit = [
  { name: "Instagram", value: 48, color: "hsl(326 75% 56%)" },
  { name: "Facebook", value: 27, color: "hsl(221 83% 53%)" },
  { name: "Email", value: 25, color: "hsl(262 83% 58%)" },
];

const timeline = [
  { status: "done", title: "Campaign created", time: "Jun 1, 9:00 AM", user: "Sarah Chen" },
  { status: "done", title: "AI strategy generated", time: "Jun 1, 9:15 AM", user: "AI Assistant" },
  { status: "done", title: "Content pillars defined", time: "Jun 2, 11:00 AM", user: "Marcus Reid" },
  { status: "done", title: "First posts published", time: "Jun 5, 10:00 AM", user: "Priya Patel" },
  { status: "active", title: "Mid-campaign optimization", time: "Jul 15, 2:00 PM", user: "Sarah Chen" },
  { status: "pending", title: "Final report", time: "Aug 31", user: "—" },
];

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { campaign, isLoading, aiStrategy, generateStrategy, isGeneratingStrategy } = useCampaign(id);
  const { contentItems: dbContentItems } = useContent({ campaign: campaign?.name });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <EmptyState
        icon={<Target className="h-6 w-6" />}
        title="Campaign not found"
        description="This campaign may have been deleted or doesn't exist."
        action={<Button onClick={() => navigate("/app/campaigns")}>Back to campaigns</Button>}
      />
    );
  }

  const cfg = campaignStatusConfig[campaign.status as CampaignStatus] || { variant: "muted", dot: "bg-muted-foreground", label: campaign.status };
  const campaignContent = dbContentItems || [];

  return (
    <div className="space-y-6">
      <Link to="/app/campaigns" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to campaigns
      </Link>

      <PageHeader
        title={campaign.name}
        description={campaign.goal}
        breadcrumbs={[
          { label: "Dashboard", href: "/app/dashboard" },
          { label: "Campaigns", href: "/app/campaigns" },
          { label: campaign.name },
        ]}
        actions={
          <>
            <Badge variant={cfg.variant}>
              <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} /> {cfg.label}
            </Badge>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" /> Edit
            </Button>
            <Button size="sm">
              <Sparkles className="h-4 w-4" /> Optimize with AI
            </Button>
          </>
        }
      />

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Reach", value: formatNumber(campaign.reach), icon: Eye, delta: "+18%" },
          { label: "Engagement", value: `${campaign.engagement}%`, icon: Heart, delta: "+2.4%" },
          { label: "Conversions", value: formatNumber(campaign.conversions), icon: Zap, delta: "+9.1%" },
          { label: "Budget Used", value: `${Math.round((campaign.spent / campaign.budget) * 100)}%`, icon: DollarSign, delta: formatCurrency(campaign.spent) },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-success">{s.delta}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="ai-strategy">AI Strategy</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Performance chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Performance over time</CardTitle>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Reach</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-2" />Engagement</span>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={performanceData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="gReach" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(243 75% 59%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(243 75% 59%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gEngage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(158 64% 52%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(158 64% 52%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area type="monotone" dataKey="reach" stroke="hsl(243 75% 59%)" strokeWidth={2} fill="url(#gReach)" />
                    <Area type="monotone" dataKey="engagement" stroke="hsl(158 64% 52%)" strokeWidth={2} fill="url(#gEngage)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel split */}
            <Card>
              <CardHeader><CardTitle className="text-base">Channel split</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={channelSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                      {channelSplit.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-2">
                  {channelSplit.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                        {c.name}
                      </span>
                      <span className="font-medium">{c.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details + goals */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Campaign details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Owner", value: campaign.owner.name, icon: Users },
                  { label: "Duration", value: `${formatDate(campaign.startDate)} – ${formatDate(campaign.endDate)}`, icon: Calendar },
                  { label: "Budget", value: `${formatCurrency(campaign.spent)} of ${formatCurrency(campaign.budget)}`, icon: DollarSign },
                  { label: "Goal", value: campaign.goal, icon: Target },
                ].map((d) => (
                  <div key={d.label} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <d.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{d.label}</p>
                      <p className="text-sm font-medium text-foreground">{d.value}</p>
                    </div>
                  </div>
                ))}
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">Budget utilization</span>
                    <span className="font-medium">{Math.round((campaign.spent / campaign.budget) * 100)}%</span>
                  </div>
                  <Progress value={(campaign.spent / campaign.budget) * 100} indicatorClassName="bg-warning" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Goals & KPIs</CardTitle>
                <Button variant="ghost" size="sm"><TrendingUp className="h-3.5 w-3.5" /> Track</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Signups target", current: 1820, target: 5000, color: "bg-primary" },
                  { label: "Reach target", current: 248000, target: 500000, color: "bg-chart-2" },
                  { label: "Engagement rate", current: 6.8, target: 8, color: "bg-warning", suffix: "%" },
                ].map((k) => (
                  <div key={k.label}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-muted-foreground">{k.label}</span>
                      <span className="font-medium">{k.current}{k.suffix ?? ""} / {k.target}{k.suffix ?? ""}</span>
                    </div>
                    <Progress value={(k.current / k.target) * 100} indicatorClassName={k.color} />
                  </div>
                ))}
                <div className="rounded-lg bg-primary/5 p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">AI prediction</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    At current pace, you'll reach 87% of your signup goal by Aug 31. Consider boosting your top Instagram post.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content tab */}
        <TabsContent value="content">
          {campaignContent.length === 0 ? (
            <EmptyState
              icon={<ImageIcon className="h-6 w-6" />}
              title="No content yet"
              description="Generate content for this campaign in the Content Studio."
              action={<Button asChild><Link to="/app/content-studio">Go to Content Studio</Link></Button>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {campaignContent.map((item: any) => {
                const sc = contentStatusConfig[item.status as ContentStatus] || { label: item.status, className: "bg-muted text-muted-foreground", dot: "bg-muted" };
                const Icon = platformIcons[item.type as keyof typeof platformIcons] ?? ImageIcon;
                return (
                  <Card key={item.id || item._id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-xs text-muted-foreground">{item.platform}</span>
                        </div>
                        <Badge className={cn("border-0", sc.className)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} /> {sc.label}
                        </Badge>
                      </div>
                      <h4 className="mt-3 font-medium text-foreground">{item.title}</h4>
                      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{item.body}</p>
                      {item.hashtags && (
                        <p className="mt-2 text-xs text-primary">{item.hashtags.join(" ")}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-6">
              <div className="relative space-y-6 pl-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                {timeline.map((t, i) => (
                  <div key={i} className="relative">
                    <div className={cn(
                      "absolute -left-[19px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-card",
                      t.status === "done" ? "bg-success text-success-foreground" :
                      t.status === "active" ? "bg-primary text-primary-foreground" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {t.status === "done" ? <CheckCircle2 className="h-3 w-3" /> :
                       t.status === "active" ? <Play className="h-2.5 w-2.5" /> :
                       <Clock className="h-3 w-3" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.time} · {t.user}</p>
                      </div>
                      {t.status === "active" && <Badge variant="default">In progress</Badge>}
                      {t.status === "pending" && <Badge variant="muted">Upcoming</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Strategy */}
        <TabsContent value="ai-strategy" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">AI-generated strategy</CardTitle>
              </div>
              {aiStrategy && (
                <Button variant="outline" size="sm" onClick={() => generateStrategy()} disabled={isGeneratingStrategy}>
                  <Sparkles className="h-3.5 w-3.5" /> {isGeneratingStrategy ? "Regenerating..." : "Regenerate"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-5">
              {isGeneratingStrategy ? (
                <div className="py-12 text-center space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                  <p className="text-sm text-muted-foreground">Strategix AI is writing campaign playbook...</p>
                </div>
              ) : aiStrategy ? (
                [
                  { title: "Target Audience", desc: aiStrategy.audience },
                  { title: "Marketing Funnel", desc: aiStrategy.funnel },
                  { title: "Content Pillars", desc: aiStrategy.pillars },
                  { title: "Posting Schedule", desc: aiStrategy.schedule },
                  { title: "Budget Suggestions", desc: aiStrategy.budget },
                  { title: "KPIs", desc: aiStrategy.kpis },
                ].map((s) => (
                  <div key={s.title} className="rounded-xl border border-border p-4">
                    <p className="text-sm font-semibold text-foreground">{s.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Sparkles className="h-10 w-10 text-primary/40 mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground">No strategy generated yet</h4>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    Let Strategix AI analyze your campaign goals and design a complete target strategy.
                  </p>
                  <Button className="mt-4" onClick={() => generateStrategy()} disabled={isGeneratingStrategy}>
                    <Sparkles className="h-4 w-4" /> Generate Strategy with AI
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

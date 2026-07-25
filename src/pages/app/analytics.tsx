import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Eye, Heart, Zap, Users, Sparkles, ArrowUpRight, ArrowDownRight, ChartBar as BarChart3, Calendar, Download, Share2 } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, PieChart, Pie,
  RadialBar, RadialBarChart, Legend,
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Sparkline } from "@/components/shared/sparkline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { campaigns } from "@/lib/data";

const engagementData = [
  { day: "Mon", instagram: 4200, linkedin: 2100, twitter: 1800 },
  { day: "Tue", instagram: 5100, linkedin: 2800, twitter: 2200 },
  { day: "Wed", instagram: 4800, linkedin: 2400, twitter: 1900 },
  { day: "Thu", instagram: 6200, linkedin: 3200, twitter: 2600 },
  { day: "Fri", instagram: 5800, linkedin: 2900, twitter: 2400 },
  { day: "Sat", instagram: 7100, linkedin: 1800, twitter: 1500 },
  { day: "Sun", instagram: 6500, linkedin: 1500, twitter: 1300 },
];

const growthData = [
  { month: "Jan", followers: 12400, reach: 89000 },
  { month: "Feb", followers: 13800, reach: 102000 },
  { month: "Mar", followers: 15200, reach: 118000 },
  { month: "Apr", followers: 16900, reach: 134000 },
  { month: "May", followers: 18400, reach: 152000 },
  { month: "Jun", followers: 20100, reach: 178000 },
  { month: "Jul", followers: 22400, reach: 201000 },
];

const channelPerformance = [
  { name: "Instagram", value: 42, color: "hsl(326 75% 56%)" },
  { name: "LinkedIn", value: 28, color: "hsl(210 100% 50%)" },
  { name: "Twitter", value: 18, color: "hsl(203 89% 53%)" },
  { name: "Email", value: 12, color: "hsl(262 83% 58%)" },
];

const contentPerformance = [
  { name: "Reels", posts: 24, engagement: 8.4 },
  { name: "Carousels", posts: 18, engagement: 6.2 },
  { name: "Stories", posts: 42, engagement: 4.8 },
  { name: "Single Posts", posts: 31, engagement: 3.9 },
  { name: "Email", posts: 12, engagement: 5.6 },
];

const postingFreq = [
  { week: "W1", posts: 8 },
  { week: "W2", posts: 12 },
  { week: "W3", posts: 10 },
  { week: "W4", posts: 15 },
  { week: "W5", posts: 14 },
  { week: "W6", posts: 18 },
];

const healthScore = [{ name: "score", value: 78, fill: "hsl(158 64% 52%)" }];

export default function AnalyticsPage() {
  const [range, setRange] = useState("7d");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track performance across every campaign and channel."
        breadcrumbs={[{ label: "Dashboard", href: "/app/dashboard" }, { label: "Analytics" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Share2 className="h-4 w-4" /> Share</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export</Button>
          </>
        }
      />

      {/* Range selector */}
      <Tabs value={range} onValueChange={setRange}>
        <TabsList>
          <TabsTrigger value="24h">24h</TabsTrigger>
          <TabsTrigger value="7d">7 days</TabsTrigger>
          <TabsTrigger value="30d">30 days</TabsTrigger>
          <TabsTrigger value="90d">90 days</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Reach" value="496K" delta={12.4} deltaLabel="vs prev period" icon={<Eye className="h-5 w-5" />} chart={<Sparkline data={[30,40,35,50,45,60,55,68]} color="hsl(243 75% 59%)" />} />
        <StatCard label="Avg. Engagement" value="6.2%" delta={3.1} deltaLabel="vs prev period" icon={<Heart className="h-5 w-5" />} chart={<Sparkline data={[3,4,3.5,5,4.5,6,5.5,6.2]} color="hsl(158 64% 52%)" />} />
        <StatCard label="Conversions" value="3,072" delta={8.7} deltaLabel="vs prev period" icon={<Zap className="h-5 w-5" />} chart={<Sparkline data={[10,22,18,30,25,35,40,48]} color="hsl(38 92% 50%)" />} />
        <StatCard label="New Followers" value="2,240" delta={-2.3} deltaLabel="vs prev period" icon={<Users className="h-5 w-5" />} chart={<Sparkline data={[40,38,45,42,48,44,50,46]} color="hsl(262 83% 58%)" />} />
      </div>

      {/* Main charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Engagement by channel */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Engagement by channel</CardTitle>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-1" />Instagram</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-2" />LinkedIn</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-3" />Twitter</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                <Bar dataKey="instagram" fill="hsl(243 75% 59%)" radius={[4,4,0,0]} />
                <Bar dataKey="linkedin" fill="hsl(158 64% 52%)" radius={[4,4,0,0]} />
                <Bar dataKey="twitter" fill="hsl(38 92% 50%)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Marketing health score */}
        <Card>
          <CardHeader><CardTitle className="text-base">Marketing health score</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart innerRadius="65%" outerRadius="90%" data={healthScore} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="-mt-[125px] text-center">
              <p className="font-display text-4xl font-bold">78</p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </div>
            <div className="mt-12 w-full space-y-2">
              {[
                { label: "Posting consistency", value: 85, color: "bg-success" },
                { label: "Audience engagement", value: 72, color: "bg-primary" },
                { label: "Conversion rate", value: 68, color: "bg-warning" },
                { label: "Content variety", value: 88, color: "bg-chart-4" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium">{m.value}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", m.color)} style={{ width: `${m.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth trends + channel split */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Growth trends</CardTitle>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Followers</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-2" />Reach</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={growthData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                <Line type="monotone" dataKey="followers" stroke="hsl(243 75% 59%)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="reach" stroke="hsl(158 64% 52%)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Channel distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={channelPerformance} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {channelPerformance.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-2">
              {channelPerformance.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />{c.name}</span>
                  <span className="font-medium">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content performance + posting frequency */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Content performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={contentPerformance} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={80} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                <Bar dataKey="engagement" fill="hsl(243 75% 59%)" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Posting frequency</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={postingFreq} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gFreq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }} />
                <Area type="monotone" dataKey="posts" stroke="hsl(38 92% 50%)" strokeWidth={2.5} fill="url(#gFreq)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign performance table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Campaign performance</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="pb-3 text-left font-medium">Campaign</th>
                  <th className="pb-3 text-right font-medium">Reach</th>
                  <th className="pb-3 text-right font-medium">Engagement</th>
                  <th className="pb-3 text-right font-medium">Conversions</th>
                  <th className="pb-3 text-right font-medium">ROI</th>
                  <th className="pb-3 text-left font-medium">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.filter((c) => c.status === "active" || c.status === "completed").map((c) => {
                  const roi = c.spent > 0 ? Math.round(((c.conversions * 45 - c.spent) / c.spent) * 100) : 0;
                  return (
                    <tr key={c.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                          <span className="font-medium text-foreground">{c.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">{c.reach.toLocaleString()}</td>
                      <td className="py-3 text-right">{c.engagement}%</td>
                      <td className="py-3 text-right">{c.conversions.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <span className={cn("inline-flex items-center gap-0.5 font-medium", roi >= 0 ? "text-success" : "text-destructive")}>
                          {roi >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(roi)}%
                        </span>
                      </td>
                      <td className="py-3"><div className="h-8 w-20"><Sparkline data={[20,30,25,40,35,50,45]} color={c.color} /></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights panel */}
      <Card className="border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">AI Insights</CardTitle>
              <p className="text-xs text-muted-foreground">Personalized recommendations to improve performance</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: TrendingUp, title: "Double down on Reels", text: "Instagram Reels drive 42% of your engagement. Post 2 more per week to boost reach by ~18%.", tag: "High impact", color: "bg-success/10 text-success" },
            { icon: Calendar, title: "Optimal posting time", text: "Thursday 6 PM consistently outperforms by 28%. Schedule your next launch post then.", tag: "Timing", color: "bg-primary/10 text-primary" },
            { icon: BarChart3, title: "Underused channel", text: "Your LinkedIn engagement is below industry average. Add 1 thought-leadership post weekly.", tag: "Opportunity", color: "bg-warning/10 text-warning" },
            { icon: Heart, title: "Audience shift", text: "Followers aged 25-34 grew 15% this month. Tailor content to early-career professionals.", tag: "Audience", color: "bg-chart-4/10 text-chart-4" },
          ].map((insight) => (
            <div key={insight.title} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", insight.color)}>
                  <insight.icon className="h-4.5 w-4.5" />
                </div>
                <Badge variant="muted" className={cn("border-0", insight.color)}>{insight.tag}</Badge>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">{insight.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{insight.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

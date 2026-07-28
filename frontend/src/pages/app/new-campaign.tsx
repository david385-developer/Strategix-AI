import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Send, Target, Users, Filter, CalendarDays, DollarSign, TrendingUp, Check, ArrowRight, Loader as Loader2, Lightbulb, Megaphone, Zap, Eye, Heart, Share2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

import { useCampaigns } from "@/hooks/use-campaigns";
import { campaignService } from "@/services/campaign";
import { integrationsService } from "@/services/integrations";

type Phase = "input" | "generating" | "result";

const exampleObjectives = [
  "Launch our new AI-powered analytics product to B2B SaaS companies",
  "Drive 1,000 signups for our summer webinar series",
  "Build brand awareness for our sustainable fashion line on Instagram",
  "Reactivate 2,000 dormant email subscribers with a holiday campaign",
];

export default function NewCampaignPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("input");
  const [objective, setObjective] = useState("");
  const [form, setForm] = useState({ name: "", budget: "", startDate: "", endDate: "" });

  const [aiBudget, setAiBudget] = useState("10000");
  const [aiStartDate, setAiStartDate] = useState(() => {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  });
  const [aiEndDate, setAiEndDate] = useState(() => {
    const future = new Date();
    future.setDate(future.getDate() + 90);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}`;
  });

  const { createCampaign, isCreating } = useCampaigns();
  const [createdCampaignId, setCreatedCampaignId] = useState("");
  const [generatedStrategy, setGeneratedStrategy] = useState<any>(null);
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);

  useEffect(() => {
    integrationsService.getGoogleStatus()
      .then(res => {
        if (res.success) {
          setGoogleConnected(res.data.connected);
        }
      })
      .catch(() => setGoogleConnected(false));
  }, []);

  const handleAIGenerate = async () => {
    if (!objective.trim()) return;
    if (!aiBudget || !aiStartDate || !aiEndDate) {
      toast.error("Required fields missing", "Please fill in the budget and dates for the campaign scheduling.");
      return;
    }
    setPhase("generating");
    try {
      const res = await createCampaign({
        name: objective.length > 30 ? objective.slice(0, 27) + "..." : objective,
        goal: objective,
        budget: Number(aiBudget),
        startDate: new Date(aiStartDate).toISOString(),
        endDate: new Date(aiEndDate).toISOString(),
        channel: ["linkedin", "twitter", "email"],
        status: "active",
      });

      if (res.success) {
        const campaignId = res.data.campaign.id || res.data.campaign._id;
        setCreatedCampaignId(campaignId);

        const stratRes = await campaignService.generateAIStrategy(campaignId);
        if (stratRes.success) {
          setGeneratedStrategy(stratRes.data.strategy);
          setPhase("result");
        }
      }
    } catch (err: any) {
      toast.error("AI Planner failed", err.response?.data?.message || "Failed to generate campaign strategy.");
      setPhase("input");
    }
  };

  const handleManualSave = async () => {
    if (!form.name || !form.budget || !form.startDate || !form.endDate) {
      toast.error("Required fields missing", "Please fill in all manual fields.");
      return;
    }
    try {
      await createCampaign({
        name: form.name,
        goal: "Manual Campaign Setup",
        budget: Number(form.budget),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        channel: ["email"],
        status: "draft",
      });
      toast.success("Campaign created", "Your campaign has been saved as a draft.");
      navigate("/app/campaigns");
    } catch (err: any) {
      toast.error("Creation failed", err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/app/campaigns" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to campaigns
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Create a campaign</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Tell Strategix AI your objective and get a complete strategy in seconds.
        </p>
      </div>

      {/* Google Calendar sync status banner */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          {googleConnected === null ? (
            <span className="text-muted-foreground">Checking calendar sync status...</span>
          ) : googleConnected ? (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <Check className="h-4 w-4" />
              <span>Google Calendar Synchronization active. This campaign will automatically sync.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span>Google Calendar is not connected. Connect under Settings &gt; Integrations to auto-sync.</span>
            </div>
          )}
          {googleConnected && (
            <span className="text-muted-foreground font-normal bg-secondary px-2.5 py-1 rounded-full">
              Reminders: 7d, 3d, 1d, 1h before campaign
            </span>
          )}
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {/* Input phase */}
        {phase === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* AI Planner card */}
            <Card className="border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground shadow-glow">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">AI Campaign Planner</CardTitle>
                    <p className="text-xs text-muted-foreground">Describe what you want to achieve</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>What's your campaign objective?</Label>
                  <Textarea
                    placeholder="e.g. Launch our new product line and drive 5,000 signups in 90 days"
                    rows={3}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                  />
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Lightbulb className="h-3.5 w-3.5" /> Try an example
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exampleObjectives.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setObjective(ex)}
                        className="rounded-lg border border-border bg-card px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Planner Date & Budget Scheduling Selection */}
                <div className="grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ai-budget" className="text-xs font-semibold">Budget (USD)</Label>
                    <Input 
                      id="ai-budget" 
                      type="number" 
                      placeholder="10000" 
                      value={aiBudget} 
                      onChange={(e) => setAiBudget(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ai-start" className="text-xs font-semibold">Start Date</Label>
                    <Input 
                      id="ai-start" 
                      type="date" 
                      value={aiStartDate} 
                      onChange={(e) => setAiStartDate(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ai-end" className="text-xs font-semibold">End Date</Label>
                    <Input 
                      id="ai-end" 
                      type="date" 
                      value={aiEndDate} 
                      onChange={(e) => setAiEndDate(e.target.value)} 
                    />
                  </div>
                </div>

                <Button onClick={handleAIGenerate} disabled={!objective.trim() || isCreating} size="lg" className="w-full">
                  <Sparkles className="h-4 w-4" /> Generate strategy
                </Button>
              </CardContent>
            </Card>

            {/* Or fill manually */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Or set up manually</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign name</Label>
                  <Input id="name" placeholder="e.g. Summer Launch 2025" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (USD)</Label>
                    <Input id="budget" type="number" placeholder="10000" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start">Start date</Label>
                    <Input id="start" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End date</Label>
                    <Input id="end" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isCreating}
                  onClick={handleManualSave}
                >
                  Create draft campaign
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Generating phase */}
        {phase === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground shadow-elevated">
                <Sparkles className="h-10 w-10 animate-pulse-soft" />
              </div>
              <div className="absolute inset-0 animate-ping rounded-3xl bg-primary/20" />
            </div>
            <h3 className="mt-6 font-display text-lg font-semibold">Generating your strategy…</h3>
            <p className="mt-1 text-sm text-muted-foreground">AI is analyzing your objective and building a plan</p>
            <div className="mt-6 flex flex-col gap-2">
              {["Analyzing objective", "Defining audience", "Building funnel", "Suggesting budget"].map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.4 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> {s}…
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Result phase */}
        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-success/30 bg-gradient-to-b from-success/[0.04] to-transparent">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Check className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Strategy ready!</p>
                  <p className="text-sm text-muted-foreground">Review the AI-generated plan below and create your campaign.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPhase("input")}>Start over</Button>
              </CardContent>
            </Card>

            {/* Generated strategy in beautiful cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Target, title: "Campaign Strategy", color: "bg-primary/10 text-primary", text: generatedStrategy?.funnel },
                { icon: Users, title: "Target Audience", color: "bg-chart-2/10 text-chart-2", text: generatedStrategy?.audience },
                { icon: Filter, title: "Marketing Funnel", color: "bg-chart-4/10 text-chart-4", text: generatedStrategy?.funnel },
                { icon: CalendarDays, title: "Posting Schedule", color: "bg-warning/10 text-warning", text: generatedStrategy?.schedule },
                { icon: DollarSign, title: "Budget Suggestions", color: "bg-success/10 text-success", text: generatedStrategy?.budget },
                { icon: TrendingUp, title: "KPIs & Targets", color: "bg-chart-5/10 text-chart-5", text: generatedStrategy?.kpis },
              ].map((s, i) => (
                <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="h-full">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", s.color)}>
                          <s.icon className="h-4.5 w-4.5" />
                        </div>
                        <h3 className="font-display text-base font-semibold">{s.title}</h3>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Content pillars */}
            <Card>
              <CardHeader><CardTitle className="text-base">Content pillars</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {(generatedStrategy?.pillars
                  ? generatedStrategy.pillars
                      .split(/,|\n/)
                      .map((p: string) => p.replace(/^\d+[\.\)]\s*/, "").trim())
                      .filter(Boolean)
                      .slice(0, 5)
                  : ["Product Storytelling", "Customer Success", "Behind the Scenes", "Educational Tips", "Industry Trends"]
                ).map((p: string, i: number) => (
                  <div key={p} className="rounded-xl border border-border p-4 text-center">
                    <div className={cn("mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white")}
                      style={{ background: ["hsl(243 75% 59%)","hsl(158 64% 52%)","hsl(38 92% 50%)","hsl(262 83% 58%)","hsl(199 89% 48%)"][i] }}>
                      {i + 1}
                    </div>
                    <p className="text-xs font-medium text-foreground">{p}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Predicted outcomes */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">AI predicted outcomes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { icon: Eye, label: "Est. Reach", value: "480K", color: "text-primary" },
                    { icon: Heart, label: "Est. Engagement", value: "7.2%", color: "text-chart-2" },
                    { icon: Zap, label: "Est. Signups", value: "4,350", color: "text-warning" },
                    { icon: Share2, label: "Est. Shares", value: "1.8K", color: "text-chart-4" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-muted/30 p-4 text-center">
                      <s.icon className={cn("mx-auto h-5 w-5", s.color)} />
                      <p className="mt-2 font-display text-xl font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setPhase("input")}>Refine objective</Button>
              <Button variant="outline" onClick={handleAIGenerate}>
                <Sparkles className="h-4 w-4" /> Regenerate
              </Button>
              <Button onClick={() => { toast.success("Campaign created!", "Your campaign is now active."); navigate(`/app/campaigns/${createdCampaignId}`); }}>
                <Megaphone className="h-4 w-4" /> Create this campaign <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

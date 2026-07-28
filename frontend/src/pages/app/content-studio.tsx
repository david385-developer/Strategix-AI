import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Instagram, Linkedin, Facebook, Twitter, Mail, FileText, Hash, MousePointerClick, Image as ImageIcon, Copy, Check, Pencil, RefreshCw, Heart, Save, Send, Loader as Loader2, Wand as Wand2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea, Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { ContentType } from "@/types";

const contentTypes: { id: ContentType; label: string; icon: typeof Instagram }[] = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "twitter", label: "Twitter", icon: Twitter },
  { id: "email", label: "Email", icon: Mail },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "cta", label: "CTA", icon: MousePointerClick },
  { id: "hashtags", label: "Hashtags", icon: Hash },
  { id: "image-prompt", label: "Image Prompt", icon: ImageIcon },
];

const generatedSamples: Record<ContentType, { title: string; body: string; hashtags?: string[]; cta?: string }> = {
  instagram: {
    title: "Summer Launch Teaser",
    body: "Something big is coming. ☀️\n\nOur most anticipated launch yet arrives in 48 hours. We've spent months perfecting every detail — and we can't wait to share it with you.\n\nSet your reminders. You won't want to miss this. 🚀",
    hashtags: ["#SummerLaunch", "#NewDrop", "#StayTuned", "#Innovation", "#BrandName"],
    cta: "Link in bio",
  },
  linkedin: {
    title: "Thought Leadership: The Future of Marketing Ops",
    body: "Marketing in 2025 isn't about more channels. It's about smarter orchestration.\n\nAfter working with 200+ brands, we noticed one pattern: teams that align their content pillars with funnel stages see 3x higher conversion.\n\nHere's the framework we use ↓",
    cta: "Read the full breakdown in the comments",
  },
  facebook: {
    title: "Community Milestone Celebration",
    body: "Behind every great product is a community that believed in it early. 🎉\n\nToday we're celebrating 10,000 of you who've been with us since day one. Thank you for being part of this journey — the best is yet to come.",
    cta: "Join the celebration",
  },
  twitter: {
    title: "Insight Thread Hook",
    body: "We analyzed 10,000 marketing campaigns.\n\nHere's what the top 1% do differently (and how you can copy it) 🧵",
    hashtags: ["#MarketingOps", "#GrowthHacking", "#MarketingTips"],
  },
  email: {
    title: "Product Launch Announcement",
    body: "Hi {first_name},\n\nThe wait is over. Our new product is officially live.\n\nFor the next 48 hours, early supporters get an exclusive 30% discount. Here's what's new:\n\n• Feature one that saves you hours\n• Feature two that boosts results\n• Feature three your team will love\n\nDon't miss out — this offer ends soon.",
    cta: "Get 30% off now",
  },
  blog: {
    title: "The Complete Guide to AI Marketing Operations",
    body: "Marketing teams today manage more complexity than ever before. Between fragmented channels, rising content demands, and pressure to prove ROI, traditional workflows are breaking down.\n\nIn this guide, we explore how AI-native operations reshape the way teams plan, produce, and measure campaigns — from a single intelligent workspace...",
    cta: "Read full article",
  },
  cta: {
    title: "High-conversion CTA options",
    body: "1. Start your free trial — no credit card needed\n2. Join 4,000+ teams already growing with us\n3. See it in action (2 min demo)\n4. Get the playbook that 10x'd our output\n5. Claim your 30% launch discount",
  },
  hashtags: {
    title: "Hashtag set (30)",
    body: "#SummerLaunch #NewDrop #ProductLaunch #Innovation #MarketingOps #GrowthHacking #BrandStory #BehindTheScenes #SmallBusiness #EntrepreneurLife #ContentMarketing #DigitalMarketing #SocialMediaStrategy #MarketingTips #BrandGrowth #StartupLife #LaunchDay #NewRelease #MustHave #TrendingNow #GetReady #Countdown #ExclusiveDrop #EarlyAccess #LimitedOffer #CommunityFirst #CustomerLove #BrandLoyalty #StayTuned #ComingSoon",
  },
  "image-prompt": {
    title: "AI Image Generation Prompt",
    body: "A bright, airy product photography shot of our new product on a clean white surface, soft natural lighting from the left, subtle shadow, minimal props including a sprig of fresh greenery and a glass of iced coffee, summer color palette with warm golden tones, shallow depth of field, professional commercial photography style, 4K, high detail — aspect ratio 1:1",
  },
};

import { useContent } from "@/hooks/use-content";

export default function ContentStudioPage() {
  const { toast } = useToast();
  const [activeType, setActiveType] = useState<ContentType>("instagram");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["ct1"]));
  const [copied, setCopied] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T10:00`;
  });

  const { createContent, generateAIContent, contentItems: recentDrafts } = useContent();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scheduleDateParam = params.get("scheduleDate");
    if (scheduleDateParam) {
      const date = new Date(scheduleDateParam);
      if (!isNaN(date.getTime())) {
        const pad = (n: number) => n.toString().padStart(2, "0");
        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        setScheduleDate(formatted);
        setShowScheduleModal(true);
        // Clear param from URL to avoid modal reopening on re-renders
        const url = new URL(window.location.href);
        url.searchParams.delete("scheduleDate");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setResult(null);
    try {
      const res = await generateAIContent({
        type: activeType,
        platform: current.label,
        promptText: prompt,
      });
      if (res.success) {
        setResult(res.data.content);
        toast.success("Content generated!", `Your ${current.label} content is ready.`);
      }
    } catch (err: any) {
      toast.error("Generation failed", err.response?.data?.message || "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  };

  const copy = () => {
    if (!result) return;
    const text = [result.body, result.hashtags?.join(" "), result.cta].filter(Boolean).join("\n\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  const toggleFavorite = () => {
    const id = `gen-${activeType}`;
    setFavorites((f) => {
      const next = new Set(f);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await createContent({
        title: result.title || "AI Generated Content",
        body: result.body,
        hashtags: result.hashtags,
        cta: result.cta,
        platform: current.label,
        type: activeType,
        status: "draft",
      });
      toast.success("Content saved!", "Your piece has been added to drafts.");
    } catch (err: any) {
      toast.error("Save failed", err.response?.data?.message || "Failed to save draft.");
    }
  };

  const handleSchedule = async () => {
    if (!result) return;
    try {
      const selectedDate = new Date(scheduleDate);
      if (isNaN(selectedDate.getTime())) {
        toast.error("Invalid Date", "Please select a valid date and time.");
        return;
      }
      const minDate = new Date(Date.now() - 120000); // 2 minutes grace
      if (selectedDate < minDate) {
        toast.error("Invalid Date", "Scheduled date must be in the future.");
        return;
      }

      await createContent({
        title: result.title || "AI Generated Content",
        body: result.body,
        hashtags: result.hashtags,
        cta: result.cta,
        platform: current.label,
        type: activeType,
        status: "scheduled",
        scheduledFor: selectedDate.toISOString(),
      });
      toast.success(
        "Content scheduled!",
        `Successfully scheduled for ${selectedDate.toLocaleDateString()} at ${selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`
      );
      setShowScheduleModal(false);
    } catch (err: any) {
      toast.error("Scheduling failed", err.response?.data?.message || "Failed to schedule content.");
    }
  };

  const current = contentTypes.find((t) => t.id === activeType)!;
  const isFav = favorites.has(`gen-${activeType}`);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Studio"
        description="Generate on-brand content for every platform with AI."
        breadcrumbs={[{ label: "Dashboard", href: "/app/dashboard" }, { label: "Content Studio" }]}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Content type selector */}
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Content type</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 lg:grid-cols-2">
              {contentTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setActiveType(t.id); setResult(null); }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all",
                    activeType === t.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <t.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">AI credits</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">237 / 500 used this month</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: "47%" }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generator + result */}
        <div className="space-y-6">
          {/* Prompt input */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                  <Wand2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base">Generate {current.label} content</CardTitle>
                  <p className="text-xs text-muted-foreground">Describe what you want and AI will craft it for you</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>What's the content about?</Label>
                <Textarea
                  placeholder={`e.g. Teaser post for our summer product launch targeting young professionals`}
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["On-brand", "Include emoji", "Add CTA", "Concise", "Engaging hook"].map((t) => (
                  <button key={t} className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                    {t}
                  </button>
                ))}
              </div>
              <Button onClick={handleGenerate} disabled={generating} size="lg" className="w-full">
                {generating ? (<><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>) : (<><Sparkles className="h-4 w-4" /> Generate {current.label} content</>)}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          <AnimatePresence mode="wait">
            {generating && (
              <motion.div key="gen-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                        <Sparkles className="h-8 w-8 animate-pulse-soft" />
                      </div>
                      <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground">Crafting your {current.label} content…</p>
                    <p className="mt-1 text-xs text-muted-foreground">AI is matching your brand voice</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {result && !generating && (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <current.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{result.title}</span>
                    </div>
                    <Badge variant="success"><Sparkles className="h-3 w-3" /> AI Generated</Badge>
                  </div>
                  <CardContent className="p-5">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{result.body}</pre>

                    {result.hashtags && (
                      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                        {result.hashtags.map((h: string) => (
                          <span key={h} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{h}</span>
                        ))}
                      </div>
                    )}
                    {result.cta && (
                      <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
                        <p className="text-xs text-muted-foreground">Call to action</p>
                        <p className="text-sm font-medium text-primary">{result.cta}</p>
                      </div>
                    )}
                  </CardContent>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/20 px-5 py-3">
                    <Button size="sm" variant={copied ? "success" : "outline"} onClick={copy}>
                      {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                    </Button>
                    <Button size="sm" variant="outline"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                    <Button size="sm" variant="outline" onClick={handleGenerate}><RefreshCw className="h-3.5 w-3.5" /> Regenerate</Button>
                    <Button size="sm" variant="outline" onClick={toggleFavorite}>
                      <Heart className={cn("h-3.5 w-3.5", isFav && "fill-destructive text-destructive")} />
                      {isFav ? "Favorited" : "Favorite"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleSave}><Save className="h-3.5 w-3.5" /> Save</Button>
                    <Button size="sm" className="ml-auto" onClick={() => setShowScheduleModal(true)}><Send className="h-3.5 w-3.5" /> Schedule</Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {!result && !generating && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <current.icon className="h-7 w-7" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground">Ready to generate {current.label} content</p>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">Describe your content above and click generate. AI will match your brand voice and style.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent generations */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Recent generations</h3>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(recentDrafts && recentDrafts.length > 0 ? recentDrafts.slice(0, 4) : [
                { type: "instagram", title: "Summer Launch Teaser", favorite: true },
                { type: "twitter", title: "Product Thread Hook", favorite: true },
                { type: "linkedin", title: "Thought Leadership Post", favorite: false },
                { type: "email", title: "Webinar Reminder", favorite: false },
              ]).map((r: any, i: number) => {
                const Icon = contentTypes.find((t) => t.id === r.type)?.icon || FileText;
                return (
                  <Card key={r.id || r._id || i} className="cursor-pointer transition-all hover:shadow-soft" onClick={() => {
                    setResult(r);
                    setPrompt(r.body || "");
                    setActiveType(r.type as ContentType || "instagram");
                  }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <p className="flex-1 truncate text-sm font-medium text-foreground">{r.title}</p>
                        <Heart className={cn("h-3.5 w-3.5", r.favorite ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg animate-in zoom-in-95 duration-200">
            <h3 className="font-display text-lg font-semibold text-foreground">Schedule Content</h3>
            <p className="mt-1.5 text-xs text-muted-foreground">Select a custom date and time to publish this content on {current.label}.</p>
            
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Posting Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e: any) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full h-10 px-3 rounded-lg border border-border"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSchedule}>Confirm Schedule</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

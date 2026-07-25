import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Check, Zap, Brain, CalendarDays, ChartBar as BarChart3, SquarePen as PenSquare, Users, Target, Rocket, TrendingUp, MessageSquare, Shield, Clock, Layers, Workflow, Star, Quote, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingNav, MarketingFooter } from "@/components/marketing/layout";
import { cn } from "@/lib/utils";

const features = [
  { icon: Brain, title: "AI Campaign Planner", desc: "Describe your goal — get a full strategy with audience, funnel, pillars, and KPIs in seconds." },
  { icon: PenSquare, title: "Content Studio", desc: "Generate on-brand content for every platform — Instagram, LinkedIn, email, blogs, and more." },
  { icon: CalendarDays, title: "Smart Calendar", desc: "Visualize and schedule across channels with drag-and-drop and color-coded statuses." },
  { icon: BarChart3, title: "Unified Analytics", desc: "Track performance across every campaign with a marketing health score and AI insights." },
  { icon: Users, title: "Team Collaboration", desc: "Assign tasks, approve content, and keep everyone aligned in one shared workspace." },
  { icon: Workflow, title: "Approval Workflows", desc: "Streamline reviews with built-in approvals, comments, and version history." },
];

const steps = [
  { icon: Target, title: "Set your goal", desc: "Tell Strategix what you want to achieve. A product launch, brand awareness, lead gen — anything." },
  { icon: Brain, title: "AI builds the plan", desc: "Get a complete campaign strategy with audience, funnel, content pillars, and budget." },
  { icon: PenSquare, title: "Generate content", desc: "Create on-brand posts, captions, emails, and blogs for every channel in one click." },
  { icon: Rocket, title: "Launch & optimize", desc: "Schedule, track performance, and let AI surface insights to improve results." },
];

const aiFeatures = [
  { icon: MessageSquare, title: "Conversational planning", desc: "Chat naturally with your AI assistant to build campaigns and brainstorm ideas." },
  { icon: Layers, title: "Content pillars", desc: "AI organizes your messaging into structured pillars that align with your funnel." },
  { icon: TrendingUp, title: "Performance insights", desc: "Get weekly AI-generated recommendations to double down on what works." },
  { icon: Clock, title: "Best-time scheduling", desc: "AI predicts optimal posting times based on your audience and channel." },
];

const benefits = [
  "10x faster campaign planning", "On-brand content every time", "One source of truth for your team",
  "Data-driven decisions", "Never miss a deadline", "Prove ROI with clarity",
];

const testimonials = [
  { name: "Maya Thompson", role: "Head of Growth, Lumen", initials: "MT", quote: "Strategix replaced four tools for us. We plan, create, and measure everything from one place — and our output doubled.", rating: 5 },
  { name: "David Okafor", role: "Founder, Northwind", initials: "DO", quote: "The AI campaign planner is like having a senior strategist on call. It gave me a full launch plan in under a minute.", rating: 5 },
  { name: "Lena Fischer", role: "Marketing Lead, Vertex", initials: "LF", quote: "Our approval cycle went from five days to one. The team workspace and calendar are beautifully designed.", rating: 5 },
  { name: "Arjun Mehta", role: "Agency Owner, Brightwave", initials: "AM", quote: "I manage six client brands in Strategix. The content studio alone saves my team 15 hours a week.", rating: 5 },
];

const pricing = [
  { name: "Starter", price: "$0", period: "/mo", desc: "For solo marketers getting started", features: ["1 workspace", "AI content generation (50/mo)", "Basic analytics", "1 user"], cta: "Start free", highlight: false },
  { name: "Growth", price: "$49", period: "/mo", desc: "For growing teams scaling output", features: ["3 workspaces", "Unlimited AI generation", "Advanced analytics", "5 team members", "Approval workflows", "Content calendar"], cta: "Start 14-day trial", highlight: true },
  { name: "Scale", price: "$149", period: "/mo", desc: "For agencies and large teams", features: ["Unlimited workspaces", "Unlimited everything", "Custom AI training", "Unlimited members", "Priority support", "API access"], cta: "Contact sales", highlight: false },
];

const faqs = [
  { q: "Do I need marketing experience to use Strategix?", a: "Not at all. Strategix is built for non-technical users. The AI guides you through planning and content creation, so you can produce professional campaigns within minutes of signing up." },
  { q: "Which platforms does the Content Studio support?", a: "Instagram, LinkedIn, Facebook, Twitter/X, email, and blog content — plus CTAs, hashtag sets, and AI image prompts. You can copy, edit, regenerate, and favorite anything you generate." },
  { q: "Can my team collaborate?", a: "Yes. Workspaces support roles, task assignment, approvals, comments, and a shared activity feed so everyone stays aligned on what's shipping and what needs review." },
  { q: "How does the AI Campaign Planner work?", a: "You describe your objective in plain language. The AI returns a structured strategy — audience, marketing funnel, posting schedule, content pillars, budget suggestions, and KPIs — presented in clean cards." },
  { q: "Is there a free plan?", a: "Yes. The Starter plan is free forever and includes AI content generation, basic analytics, and one workspace. You can upgrade anytime without losing your data." },
  { q: "Can I cancel anytime?", a: "Absolutely. There are no long-term contracts. You can upgrade, downgrade, or cancel your subscription from Settings at any time." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-mesh pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="default" className="mb-5 px-3 py-1 text-xs">
                  <Sparkles className="h-3 w-3" /> Now with AI Campaign Planner
                </Badge>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl"
              >
                Plan, create, and optimize
                <br />
                <span className="text-gradient">marketing that works</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
              >
                The intelligent workspace where teams plan campaigns, generate on-brand content,
                collaborate on approvals, and measure results — all powered by AI.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
              >
                <Button size="lg" asChild className="h-12 px-7 text-base">
                  <Link to="/register">
                    Start free <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-7 text-base">
                  <Link to="/app/dashboard">View live demo</Link>
                </Button>
              </motion.div>
              <p className="mt-4 text-sm text-muted-foreground">No credit card required · Free forever plan</p>
            </div>

            {/* Dashboard preview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="relative mx-auto mt-16 max-w-5xl"
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
                <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive/60" />
                    <div className="h-3 w-3 rounded-full bg-warning/60" />
                    <div className="h-3 w-3 rounded-full bg-success/60" />
                  </div>
                  <p className="ml-2 text-xs text-muted-foreground">app.strategix.ai/dashboard</p>
                </div>
                <div className="grid grid-cols-12 gap-3 p-4">
                  <div className="col-span-3 hidden space-y-2 sm:block">
                    {["Dashboard", "Campaigns", "Content Studio", "Calendar", "Analytics"].map((l, i) => (
                      <div key={l} className={cn("rounded-lg px-3 py-2 text-xs", i === 0 ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground")}>{l}</div>
                    ))}
                  </div>
                  <div className="col-span-12 space-y-3 sm:col-span-9">
                    <div className="h-28 rounded-xl bg-gradient-to-br from-primary/10 to-chart-4/10 p-4">
                      <div className="h-3 w-32 rounded bg-primary/30" />
                      <div className="mt-2 h-5 w-48 rounded bg-foreground/20" />
                      <div className="mt-3 h-3 w-40 rounded bg-muted-foreground/20" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="rounded-xl border border-border bg-card p-3">
                          <div className="h-2.5 w-16 rounded bg-muted" />
                          <div className="mt-2 h-5 w-20 rounded bg-foreground/15" />
                          <div className="mt-2 flex items-end gap-1">
                            {[40, 60, 30, 75, 50].map((h, j) => (
                              <div key={j} className="w-2 rounded-sm bg-primary/40" style={{ height: h / 2 }} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 hidden h-24 w-24 animate-float rounded-2xl bg-gradient-to-br from-primary to-chart-4 opacity-20 blur-2xl sm:block" />
            </motion.div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="border-y border-border bg-card py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium text-muted-foreground">
              Trusted by 4,000+ marketing teams and agencies worldwide
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
              {["Lumen", "Northwind", "Vertex", "Brightwave", "Acme Co", "Helios"].map((b) => (
                <span key={b} className="font-display text-lg font-bold tracking-tight text-foreground">{b}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4">Features</Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to run marketing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                One workspace replaces your scattered docs, sheets, and tools. Plan, create, approve, and measure — without the chaos.
              </p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card className="group h-full p-6 transition-all hover:shadow-card hover:-translate-y-0.5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-muted/30 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <Badge variant="accent" className="mb-4">Why Strategix</Badge>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Marketing operations, finally calm
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Stop juggling tabs and spreadsheets. Strategix brings your entire marketing workflow into one focused, intelligent workspace.
                </p>
                <ul className="mt-8 space-y-3">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="text-sm font-medium text-foreground">{b}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" asChild className="mt-8 h-12 px-7">
                  <Link to="/register">Get started free <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Zap, label: "Faster planning", value: "10x", sub: "vs. manual spreadsheets" },
                  { icon: Brain, label: "AI-generated content", value: "1,000s", sub: "variations on-demand" },
                  { icon: Users, label: "Team alignment", value: "100%", sub: "single source of truth" },
                  { icon: Shield, label: "Approval speed", value: "5→1 day", sub: "cycle time reduction" },
                ].map((s) => (
                  <Card key={s.label} className="p-6">
                    <s.icon className="h-6 w-6 text-primary" />
                    <p className="mt-4 font-display text-3xl font-bold">{s.value}</p>
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.sub}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="warning" className="mb-4">How it works</Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">From idea to launch in 4 steps</h2>
              <p className="mt-4 text-lg text-muted-foreground">No setup. No onboarding friction. Just describe your goal and let AI handle the heavy lifting.</p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="relative"
                >
                  <Card className="h-full p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                        <s.icon className="h-5 w-5" />
                      </div>
                      <span className="font-display text-3xl font-bold text-muted/60">{i + 1}</span>
                    </div>
                    <h3 className="font-display text-base font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  </Card>
                  {i < steps.length - 1 && (
                    <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground/40 lg:block" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Features */}
        <section id="ai-features" className="relative overflow-hidden bg-secondary py-20 text-secondary-foreground sm:py-28">
          <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-10" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <Badge className="mb-4 bg-primary/20 text-primary-foreground/90 border-primary/30">
                  <Sparkles className="h-3 w-3" /> AI-powered
                </Badge>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-secondary-foreground">
                  Your AI marketing strategist
                </h2>
                <p className="mt-4 text-lg text-secondary-foreground/70">
                  Strategix AI doesn't just write captions. It plans entire campaigns, builds content strategies, and surfaces insights that help you make smarter decisions.
                </p>
                <div className="mt-8 space-y-5">
                  {aiFeatures.map((f) => (
                    <div key={f.title} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                        <f.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-foreground">{f.title}</p>
                        <p className="text-sm text-secondary-foreground/60">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/5 p-6 backdrop-blur"
              >
                <div className="flex items-center gap-2.5 border-b border-secondary-foreground/10 pb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary-foreground">Strategix AI</p>
                    <p className="text-xs text-success flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Online</p>
                  </div>
                </div>
                <div className="space-y-3 py-4">
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
                    Plan a 30-day launch campaign for our new product
                  </div>
                  <div className="max-w-[85%] space-y-3">
                    <div className="rounded-2xl rounded-bl-md bg-secondary-foreground/10 px-3.5 py-2.5 text-sm text-secondary-foreground">
                      Here's your 30-day strategy. I recommend 3 phases:
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[["Teaser", "Days 1-7"], ["Launch", "Days 8-21"], ["Sustain", "Days 22-30"]].map((p) => (
                        <div key={p[0]} className="rounded-lg bg-secondary-foreground/10 p-2.5 text-center">
                          <p className="text-xs font-semibold text-secondary-foreground">{p[0]}</p>
                          <p className="text-[10px] text-secondary-foreground/50">{p[1]}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl rounded-bl-md bg-secondary-foreground/10 px-3.5 py-2.5 text-sm text-secondary-foreground/80">
                      Want me to generate the content calendar?
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-secondary-foreground/10 pt-4">
                  <div className="flex-1 rounded-lg bg-secondary-foreground/10 px-3 py-2 text-sm text-secondary-foreground/40">Ask anything…</div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="accent" className="mb-4">Customers</Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Loved by modern marketing teams</h2>
              <p className="mt-4 text-lg text-muted-foreground">From solo founders to agencies managing dozens of brands.</p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card className="h-full p-6">
                    <Quote className="h-7 w-7 text-primary/30" />
                    <p className="mt-3 text-sm leading-relaxed text-foreground">{t.quote}</p>
                    <div className="mt-4 flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-warning text-warning" />
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-4 text-xs font-semibold text-primary-foreground">
                        {t.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-muted/30 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="default" className="mb-4">Pricing</Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
              <p className="mt-4 text-lg text-muted-foreground">Start free. Upgrade when you're ready. Cancel anytime.</p>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {pricing.map((p) => (
                <Card
                  key={p.name}
                  className={`relative p-7 ${p.highlight ? "border-primary shadow-glow ring-1 ring-primary/20" : ""}`}
                >
                  {p.highlight && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
                  )}
                  <p className="font-display text-lg font-semibold">{p.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold">{p.price}</span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </div>
                  <Button
                    className="mt-5 w-full"
                    variant={p.highlight ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/register">{p.cta}</Link>
                  </Button>
                  <ul className="mt-6 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-success" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge variant="muted" className="mb-4">FAQ</Badge>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Questions, answered</h2>
            </div>
            <div className="mt-12 space-y-3">
              {faqs.map((f) => (
                <details key={f.q} className="group rounded-xl border border-border bg-card p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="font-medium text-foreground">{f.q}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-chart-4 px-6 py-16 text-center shadow-elevated sm:px-12 sm:py-20">
            <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-10" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Start marketing smarter today
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
                Join 4,000+ teams using Strategix AI to plan, create, and optimize campaigns from one intelligent workspace.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" variant="secondary" asChild className="h-12 px-7 text-base">
                  <Link to="/register">Start free <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 border-primary-foreground/30 bg-transparent px-7 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link to="/app/dashboard">Explore the demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

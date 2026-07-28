import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Building2, Palette, Check, ArrowRight, ArrowLeft, Rocket, Users, Target, Megaphone, TrendingUp, Instagram, Linkedin, Facebook, Twitter, Mail, FileText, CircleCheck as CheckCircle2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { workspaceService } from "@/services/workspace";
import { brandService } from "@/services/brand";

const steps = [
  { id: 0, label: "Workspace", icon: Building2 },
  { id: 1, label: "Business", icon: Target },
  { id: 2, label: "Brand", icon: Palette },
  { id: 3, label: "Done", icon: CheckCircle2 },
];

const industries = ["SaaS / Software", "E-commerce", "Agency", "Health & Wellness", "Finance", "Education", "Real Estate", "Food & Beverage", "Fashion", "Other"];
const goals = ["Increase brand awareness", "Generate leads", "Drive sales", "Build community", "Launch a product", "Engage customers"];
const tones = ["Professional", "Friendly", "Bold", "Witty", "Inspiring", "Minimal"];
const platforms = [
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "twitter", label: "Twitter / X", icon: Twitter },
  { id: "email", label: "Email", icon: Mail },
  { id: "blog", label: "Blog", icon: FileText },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    workspace: "",
    businessName: "",
    industry: "",
    products: "",
    services: "",
    audience: "",
    tone: [] as string[],
    goals: [] as string[],
    platforms: [] as string[],
  });

  const toggle = (key: "tone" | "goals" | "platforms", value: string) => {
    setData((d) => ({
      ...d,
      [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value],
    }));
  };

  const [loading, setLoading] = useState(false);

  const next = async () => {
    if (step === 2) {
      setLoading(true);
      try {
        const slug = data.workspace.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const wsRes = await workspaceService.createWorkspace(data.workspace, slug);
        if (wsRes.success) {
          const ws = wsRes.data.workspace;
          const wsId = ws.id || ws._id;
          await workspaceService.switchWorkspace(wsId);
          
          await brandService.updateBrandProfile({
            businessName: data.businessName,
            industry: data.industry,
            products: data.products,
            services: data.services,
            targetAudience: data.audience,
            brandTone: data.tone.join(", "),
            marketingGoals: data.goals.join(", "),
            preferredPlatforms: data.platforms,
          });
        }
        setStep(3);
      } catch (err: any) {
        toast.error("Onboarding failed", err.response?.data?.message || "Please check your inputs and try again.");
      } finally {
        setLoading(false);
      }
    } else if (step < 3) {
      setStep((s) => s + 1);
    } else {
      toast.success("Workspace ready!", "Welcome to Strategix AI.");
      const checkoutPlanId = localStorage.getItem("checkoutPlanId");
      if (checkoutPlanId) {
        localStorage.removeItem("checkoutPlanId");
        navigate(`/app/settings?tab=billing&checkoutPlanId=${checkoutPlanId}`);
      } else {
        navigate("/app/dashboard");
      }
    }
  };
  const back = () => step > 0 && setStep((s) => s - 1);

  const canProceed = () => {
    if (step === 0) return data.workspace.trim().length > 0;
    if (step === 1) return data.businessName.trim().length > 0 && data.industry.length > 0;
    if (step === 2) return data.tone.length > 0 && data.goals.length > 0 && data.platforms.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-mesh">
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10 sm:px-6">
        {/* Logo */}
        <div className="mb-10 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Strategix<span className="text-primary">AI</span>
          </span>
        </div>

        {/* Stepper */}
        <div className="mb-10 flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all",
                    i < step
                      ? "border-success bg-success text-success-foreground"
                      : i === step
                      ? "border-primary bg-primary text-primary-foreground shadow-glow"
                      : "border-border bg-card text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={cn("text-xs font-medium", i <= step ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-2 h-0.5 flex-1 rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: i < step ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <Card className="flex-1 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h2 className="font-display text-2xl font-bold tracking-tight">Create your workspace</h2>
                  <p className="text-sm text-muted-foreground">
                    A workspace is where your team, campaigns, and content live together.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspace">Workspace name</Label>
                  <Input
                    id="workspace"
                    placeholder="e.g. Acme Marketing"
                    value={data.workspace}
                    onChange={(e) => setData((d) => ({ ...d, workspace: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Rocket, label: "Startup", desc: "Growing fast" },
                    { icon: Users, label: "Agency", desc: "Multiple clients" },
                    { icon: Megaphone, label: "In-house", desc: "One brand" },
                  ].map((t) => (
                    <button
                      key={t.label}
                      className="rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
                    >
                      <t.icon className="h-5 w-5 text-primary" />
                      <p className="mt-2 text-sm font-semibold">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Target className="h-6 w-6" />
                  </div>
                  <h2 className="font-display text-2xl font-bold tracking-tight">Business information</h2>
                  <p className="text-sm text-muted-foreground">
                    Tell us about your business so AI can tailor its suggestions.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business">Business name</Label>
                  <Input
                    id="business"
                    placeholder="e.g. Acme Inc."
                    value={data.businessName}
                    onChange={(e) => setData((d) => ({ ...d, businessName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <div className="flex flex-wrap gap-2">
                    {industries.map((ind) => (
                      <button
                        key={ind}
                        onClick={() => setData((d) => ({ ...d, industry: ind }))}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-sm transition-all",
                          data.industry === ind
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="products">Products</Label>
                    <Textarea
                      id="products"
                      placeholder="What do you sell?"
                      rows={3}
                      value={data.products}
                      onChange={(e) => setData((d) => ({ ...d, products: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="services">Services</Label>
                    <Textarea
                      id="services"
                      placeholder="What services do you offer?"
                      rows={3}
                      value={data.services}
                      onChange={(e) => setData((d) => ({ ...d, services: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Target audience</Label>
                  <Input
                    id="audience"
                    placeholder="e.g. Marketing managers at B2B SaaS companies"
                    value={data.audience}
                    onChange={(e) => setData((d) => ({ ...d, audience: e.target.value }))}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Palette className="h-6 w-6" />
                  </div>
                  <h2 className="font-display text-2xl font-bold tracking-tight">Brand profile</h2>
                  <p className="text-sm text-muted-foreground">
                    Define your brand voice and goals to keep content on-brand.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Brand tone (select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {tones.map((t) => (
                      <button
                        key={t}
                        onClick={() => toggle("tone", t)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-sm transition-all",
                          data.tone.includes(t)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Marketing goals</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {goals.map((g) => (
                      <button
                        key={g}
                        onClick={() => toggle("goals", g)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all",
                          data.goals.includes(g)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {data.goals.includes(g) && <Check className="h-3.5 w-3.5 shrink-0" />}
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preferred platforms</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {platforms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => toggle("platforms", p.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all",
                          data.platforms.includes(p.id)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        <p.icon className="h-4 w-4" />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground shadow-elevated"
                >
                  <PartyPopper className="h-10 w-10" />
                </motion.div>
                <h2 className="mt-6 font-display text-2xl font-bold tracking-tight">You're all set!</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Your workspace <span className="font-semibold text-foreground">{data.workspace || "your workspace"}</span> is ready.
                  Strategix AI will use your brand profile to personalize content and recommendations.
                </p>
                <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3 text-left">
                  {[
                    { label: "Workspace", value: data.workspace || "—" },
                    { label: "Industry", value: data.industry || "—" },
                    { label: "Brand tone", value: data.tone.join(", ") || "—" },
                    { label: "Platforms", value: `${data.platforms.length} selected` },
                  ].map((r) => (
                    <div key={r.label} className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">{r.label}</p>
                      <p className="mt-0.5 truncate text-sm font-medium text-foreground">{r.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Nav buttons */}
        <div className="mt-6 flex items-center justify-between">
          {step > 0 && step < 3 ? (
            <Button variant="ghost" onClick={back}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <Button onClick={next} disabled={!canProceed() || loading}>
              {loading ? "Creating..." : (<>Continue <ArrowRight className="h-4 w-4" /></>)}
            </Button>
          ) : (
            <Button onClick={next} size="lg" disabled={loading}>
              Enter dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

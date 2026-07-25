import { Palette, Building2, Target, Megaphone, Check, CreditCard as Edit, Sparkles, Instagram, Linkedin, Facebook, Twitter, Mail, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const platformList = [
  { id: "instagram", label: "Instagram", icon: Instagram, active: true },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, active: true },
  { id: "facebook", label: "Facebook", icon: Facebook, active: true },
  { id: "twitter", label: "Twitter / X", icon: Twitter, active: true },
  { id: "email", label: "Email", icon: Mail, active: true },
  { id: "blog", label: "Blog", icon: FileText, active: false },
];

export default function BrandPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand Profile"
        description="Define your brand identity so AI generates on-brand content."
        breadcrumbs={[{ label: "Dashboard", href: "/app/dashboard" }, { label: "Brand Profile" }]}
        actions={
          <>
            <Button variant="outline" size="sm"><Edit className="h-4 w-4" /> Edit</Button>
            <Button size="sm"><Sparkles className="h-4 w-4" /> Train AI</Button>
          </>
        }
      />

      {/* Brand identity banner */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
        <div className="absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-10" />
        <CardContent className="relative flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 rounded-2xl">
            <AvatarFallback className="rounded-2xl bg-white/20 text-2xl font-bold text-primary-foreground">SH</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Badge className="border-0 bg-white/20 text-primary-foreground"><Sparkles className="h-3 w-3" /> Brand trained</Badge>
            <h2 className="font-display text-2xl font-bold">Strategix HQ</h2>
            <p className="max-w-lg text-sm text-primary-foreground/80">
              B2B SaaS · Professional & friendly tone · Active on Instagram, LinkedIn, Twitter, and Email
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[{ label: "Tone", value: "4" }, { label: "Goals", value: "3" }, { label: "Platforms", value: "5" }].map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-primary-foreground/70">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Business information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business name</Label>
              <Input defaultValue="Strategix HQ" />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input defaultValue="SaaS / Software" />
            </div>
            <div className="space-y-2">
              <Label>Products</Label>
              <Textarea defaultValue="AI-powered marketing operations platform for teams and agencies." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Services</Label>
              <Textarea defaultValue="Campaign planning, content generation, analytics, team collaboration." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Target audience</Label>
              <Input defaultValue="Marketing managers and founders at B2B SaaS companies (50-500 employees)" />
            </div>
          </CardContent>
        </Card>

        {/* Brand voice */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Brand tone & voice</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Active tones</Label>
                <div className="flex flex-wrap gap-2">
                  {["Professional", "Friendly", "Inspiring", "Minimal"].map((t) => (
                    <Badge key={t} variant="default"><Check className="h-3 w-3" /> {t}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Brand guidelines</Label>
                <Textarea
                  defaultValue="Speak to marketers as peers. Avoid jargon. Use clear, confident language. Always include a next step. Emphasize outcomes over features."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Marketing goals</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {["Increase brand awareness", "Generate leads", "Drive sales"].map((g) => (
                <div key={g} className="flex items-center gap-2 rounded-lg border border-border p-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10 text-success"><Check className="h-3 w-3" /></span>
                  <span className="text-sm font-medium text-foreground">{g}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preferred platforms */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Preferred platforms</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {platformList.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-4",
                  p.active ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", p.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                    <p.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.active ? "Active" : "Not connected"}</p>
                  </div>
                </div>
                {p.active && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10 text-success"><Check className="h-3 w-3" /></span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

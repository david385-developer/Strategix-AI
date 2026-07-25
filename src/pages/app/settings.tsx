import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, User, Palette, Bell, Shield, CreditCard, Moon, Sun,
  Check, LogOut, Camera, Mail, Lock, Smartphone, Globe, Crown,
  Sparkles, Trash2, Download,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/lib/ui-store";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { user } from "@/lib/data";

const sections = [
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "profile", label: "Profile", icon: User },
  { id: "brand", label: "Brand", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "theme", label: "Appearance", icon: Sun },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useUIStore();
  const [active, setActive] = useState("workspace");
  const [notifSettings, setNotifSettings] = useState({
    emailApprovals: true,
    emailMentions: true,
    emailAi: false,
    emailWeekly: true,
    pushApprovals: true,
    pushMentions: false,
    pushAi: true,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your workspace, profile, and preferences."
        breadcrumbs={[{ label: "Dashboard", href: "/app/dashboard" }, { label: "Settings" }]}
      />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Section nav */}
        <nav className="space-y-1 lg:sticky lg:top-20 lg:self-start">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
          <Separator className="my-2" />
          <button
            onClick={() => { toast.info("Signed out"); navigate("/login"); }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </nav>

        {/* Content */}
        <div className="space-y-6">
          {active === "workspace" && (
            <>
              <Card>
                <CardHeader><CardTitle className="text-base">Workspace settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Workspace name</Label>
                    <Input defaultValue="Strategix HQ" />
                  </div>
                  <div className="space-y-2">
                    <Label>Workspace URL</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">app.strategix.ai/</span>
                      <Input defaultValue="strategix-hq" className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Default timezone</Label>
                    <Input defaultValue="America/New_York (EST)" />
                  </div>
                  <Button onClick={() => toast.success("Saved", "Workspace settings updated.")}>Save changes</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Danger zone</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Delete workspace</p>
                      <p className="text-xs text-muted-foreground">Permanently delete this workspace and all data.</p>
                    </div>
                    <Button variant="destructive" size="sm"><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {active === "profile" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-chart-4 text-xl font-bold text-primary-foreground">{user.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm"><Camera className="h-3.5 w-3.5" /> Change photo</Button>
                    <p className="mt-1.5 text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full name</Label>
                    <Input defaultValue={user.name} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue={user.email} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input defaultValue={user.role} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone (optional)</Label>
                    <Input placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea defaultValue="Marketing leader passionate about building products that make teams more effective." rows={3} />
                </div>
                <Button onClick={() => toast.success("Saved", "Profile updated.")}>Save changes</Button>
              </CardContent>
            </Card>
          )}

          {active === "brand" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Brand defaults</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Brand voice</Label>
                  <Textarea defaultValue="Professional, friendly, and inspiring. Speak to marketers as peers." rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Primary brand color</Label>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg border border-border bg-primary" />
                    <Input defaultValue="#4f46e5" className="max-w-[160px]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Default hashtags</Label>
                  <Input defaultValue="#MarketingOps #GrowthHacking #AI" />
                </div>
                <Button onClick={() => toast.success("Saved", "Brand defaults updated.")}>Save changes</Button>
              </CardContent>
            </Card>
          )}

          {active === "notifications" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Notification preferences</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-semibold text-foreground">Email notifications</p>
                  <div className="space-y-3">
                    {[
                      { key: "emailApprovals", label: "Content awaiting approval", desc: "When someone submits content for your review" },
                      { key: "emailMentions", label: "Mentions", desc: "When you're mentioned in a comment or task" },
                      { key: "emailAi", label: "AI insights", desc: "Weekly AI-generated performance recommendations" },
                      { key: "emailWeekly", label: "Weekly summary", desc: "Your marketing performance every Monday" },
                    ].map((n) => (
                      <div key={n.key} className="flex items-center justify-between">
                        <div><p className="text-sm font-medium text-foreground">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                        <Switch checked={notifSettings[n.key as keyof typeof notifSettings]} onCheckedChange={(v) => setNotifSettings((s) => ({ ...s, [n.key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="mb-3 text-sm font-semibold text-foreground">Push notifications</p>
                  <div className="space-y-3">
                    {[
                      { key: "pushApprovals", label: "Content approvals", desc: "Real-time alerts for pending approvals" },
                      { key: "pushMentions", label: "Mentions", desc: "When you're mentioned" },
                      { key: "pushAi", label: "AI completions", desc: "When AI finishes generating content" },
                    ].map((n) => (
                      <div key={n.key} className="flex items-center justify-between">
                        <div><p className="text-sm font-medium text-foreground">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                        <Switch checked={notifSettings[n.key as keyof typeof notifSettings]} onCheckedChange={(v) => setNotifSettings((s) => ({ ...s, [n.key]: v }))} />
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={() => toast.success("Saved", "Notification preferences updated.")}>Save preferences</Button>
              </CardContent>
            </Card>
          )}

          {active === "security" && (
            <>
              <Card>
                <CardHeader><CardTitle className="text-base">Password</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>New password</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm password</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                  </div>
                  <Button onClick={() => toast.success("Password updated", "Your password has been changed.")}>Update password</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Two-factor authentication</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success"><Smartphone className="h-5 w-5" /></div>
                      <div><p className="text-sm font-medium text-foreground">Authenticator app</p><p className="text-xs text-muted-foreground">Use an app like Google Authenticator</p></div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Mail className="h-5 w-5" /></div>
                      <div><p className="text-sm font-medium text-foreground">Email backup</p><p className="text-xs text-muted-foreground">Receive codes via email</p></div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Active sessions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { device: "MacBook Pro · Chrome", location: "New York, US", current: true },
                    { device: "iPhone 15 · Safari", location: "New York, US", current: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <div><p className="text-sm font-medium text-foreground">{s.device}</p><p className="text-xs text-muted-foreground">{s.location}</p></div>
                      </div>
                      {s.current ? <Badge variant="success">Current</Badge> : <Button variant="ghost" size="sm" className="text-destructive">Revoke</Button>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {active === "subscription" && (
            <>
              <Card className="border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground"><Crown className="h-6 w-6" /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-display text-lg font-bold">Growth Plan</p>
                          <Badge><Sparkles className="h-3 w-3" /> Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">$49/month · Renews Aug 15, 2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Manage billing</Button>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-4 border-t border-border pt-5">
                    {[{ label: "AI credits", value: "237 / 500" }, { label: "Team seats", value: "3 / 5" }, { label: "Workspaces", value: "1 / 3" }].map((u) => (
                      <div key={u.label}><p className="text-xs text-muted-foreground">{u.label}</p><p className="mt-0.5 text-sm font-semibold text-foreground">{u.value}</p></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Billing history</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["Jul 15, 2025", "Jun 15, 2025", "May 15, 2025"].map((d) => (
                      <div key={d} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div><p className="text-sm font-medium text-foreground">Growth Plan — Monthly</p><p className="text-xs text-muted-foreground">{d}</p></div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-foreground">$49.00</span>
                          <Button variant="ghost" size="sm"><Download className="h-3.5 w-3.5" /> Invoice</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {active === "theme" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">Theme</Label>
                  <div className="grid grid-cols-2 gap-3 sm:max-w-md">
                    {([["light", Sun, "Light"], ["dark", Moon, "Dark"]] as const).map(([t, Icon, label]) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          "flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all",
                          theme === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        )}
                      >
                        <Icon className={cn("h-8 w-8", theme === t ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-sm font-medium">{label}</span>
                        {theme === t && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="mb-3 block">Accent color</Label>
                  <div className="flex flex-wrap gap-2.5">
                    {["hsl(243 75% 59%)", "hsl(158 64% 52%)", "hsl(38 92% 50%)", "hsl(262 83% 58%)", "hsl(199 89% 48%)", "hsl(326 75% 56%)"].map((c, i) => (
                      <button
                        key={c}
                        className={cn("flex h-10 w-10 items-center justify-center rounded-xl ring-2 ring-offset-2 ring-offset-card transition-all", i === 0 ? "ring-foreground" : "ring-transparent hover:ring-border")}
                        style={{ background: c }}
                      >
                        {i === 0 && <Check className="h-4 w-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

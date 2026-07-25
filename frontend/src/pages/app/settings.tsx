import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, User, Palette, Bell, Shield, CreditCard, Moon, Sun,
  Check, LogOut, Camera, Mail, Lock, Smartphone, Globe, Crown,
  Sparkles, Trash2, Download, RefreshCw, AlertTriangle
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
import { useAuth } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import { useBrand } from "@/hooks/use-brand";
import { useBilling } from "@/hooks/use-billing";
import { billingService } from "@/services/billing";

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

  const { user, updateProfile } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const { brand, updateBrand } = useBrand();

  const {
    billingData,
    isLoading: isLoadingBilling,
    updateDetails,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    manualUpgrade
  } = useBilling();

  // Load Razorpay checkout script on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Profile states
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileBio, setProfileBio] = useState("");

  // Brand states
  const [brandVoice, setBrandVoice] = useState("");
  const [brandColor, setBrandColor] = useState("");
  const [brandHashtags, setBrandHashtags] = useState("");

  // Billing Form states
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custGST, setCustGST] = useState("");
  const [custCompany, setCustCompany] = useState("");
  const [custAddress, setCustAddress] = useState("");
  
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      setProfileBio(user.bio || "");
    }
  }, [user]);

  useEffect(() => {
    if (brand) {
      setBrandVoice(brand.toneOfVoice || "");
      setBrandColor(brand.primaryColor || "");
      setBrandHashtags(brand.defaultHashtags?.join(" ") || "");
    }
  }, [brand]);

  // Load Billing details on data change
  useEffect(() => {
    if (billingData?.customer) {
      setCustName(billingData.customer.customerName || "");
      setCustEmail(billingData.customer.customerEmail || "");
      setCustPhone(billingData.customer.customerPhone || "");
      setCustGST(billingData.customer.gstNumber || "");
      setCustCompany(billingData.customer.companyName || "");
      setCustAddress(billingData.customer.billingAddress || "");
    }
  }, [billingData]);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ name: profileName, email: profileEmail, bio: profileBio });
      toast.success("Saved", "Profile updated.");
    } catch (err: any) {
      toast.error("Update failed", err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleUpdateBrand = async () => {
    try {
      await updateBrand({
        toneOfVoice: brandVoice,
        primaryColor: brandColor,
        defaultHashtags: brandHashtags.split(" ").filter(Boolean),
      });
      toast.success("Saved", "Brand defaults updated.");
    } catch (err: any) {
      toast.error("Update failed", err.response?.data?.message || "Failed to update brand.");
    }
  };

  const handleSaveBillingDetails = async () => {
    try {
      await updateDetails({
        customerName: custName,
        customerEmail: custEmail,
        customerPhone: custPhone,
        gstNumber: custGST,
        companyName: custCompany,
        billingAddress: custAddress,
      });
      toast.success("Saved", "Billing details updated.");
    } catch (err: any) {
      toast.error("Save failed", err.response?.data?.message || "Failed to update billing details.");
    }
  };

  const handleManualCheckout = async (planId: string) => {
    try {
      setIsProcessingPayment(true);
      await manualUpgrade({ planId, billingCycle });
      toast.success("Subscription Active", `Plan upgraded to ${planId} successfully (Manual Sandbox mode).`);
    } catch (err: any) {
      toast.error("Upgrade failed", err.response?.data?.message || "Sandbox upgrade failed.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRazorpayCheckout = async (planId: string) => {
    if (planId === "free") {
      await handleManualCheckout("free");
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      // 1. Create Checkout Order
      const res = await billingService.createCheckout(planId, billingCycle);
      if (!res.success) {
        throw new Error(res.message || "Failed to initialize checkout.");
      }

      const orderData = res.data;

      // 2. Configure Razorpay Options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Strategix AI",
        description: `Upgrade to ${planId} plan`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          contact: orderData.customer.contact,
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            await billingService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment Verified", `Subscription to ${planId} activated successfully.`);
            window.location.reload();
          } catch (err: any) {
            toast.error("Verification failed", err.response?.data?.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            toast.warning("Payment Cancelled", "Checkout was closed.");
          }
        },
        theme: {
          color: "hsl(243 75% 59%)",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error("Checkout error", err.message || "Could not launch Razorpay gateway.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  const pricingPlans = [
    { id: "free", name: "Free", price: 0, aiLimit: 10, campaigns: 1, team: 1, storage: 50 * 1024 * 1024 },
    { id: "starter", name: "Starter", price: 29, aiLimit: 200, campaigns: 10, team: 3, storage: 2 * 1024 * 1024 * 1024 },
    { id: "professional", name: "Professional", price: 79, aiLimit: 1000, campaigns: 30, team: 10, storage: 10 * 1024 * 1024 * 1024 },
    { id: "enterprise", name: "Enterprise", price: 249, aiLimit: 5000, campaigns: 100, team: 50, storage: 100 * 1024 * 1024 * 1024 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your workspace, profile, and preferences."
        breadcrumbs={[{ label: "Dashboard", href: "/app/dashboard" }, { label: "Settings" }]}
      />

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Navigation Sidebar */}
        <div className="flex flex-row flex-wrap gap-1 md:w-64 md:flex-col">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors md:w-full",
                  active === s.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Tab contents */}
        <div className="flex-1 space-y-6">
          {active === "workspace" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Workspace Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Workspace Name</Label>
                  <Input defaultValue={activeWorkspace?.name || ""} />
                </div>
                <div className="space-y-1.5">
                  <Label>Workspace slug (url)</Label>
                  <Input defaultValue={activeWorkspace?.urlSlug || ""} disabled />
                </div>
                <Button onClick={() => toast.success("Saved", "Workspace details updated.")}>Save changes</Button>
              </CardContent>
            </Card>
          )}

          {active === "profile" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Personal Profile</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16"><AvatarFallback>{profileName.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                  <Button variant="outline" size="sm"><Camera className="mr-2 h-4 w-4" /> Change photo</Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email Address</Label>
                    <Input value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Bio / Professional Summary</Label>
                  <Input value={profileBio} onChange={(e) => setProfileBio(e.target.value)} />
                </div>
                <Button onClick={handleUpdateProfile}>Save Profile</Button>
              </CardContent>
            </Card>
          )}

          {active === "brand" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Brand Guidelines Defaults</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Brand Tone of Voice</Label>
                  <Input value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} placeholder="e.g. bold, witty, professional" />
                </div>
                <div className="space-y-1.5">
                  <Label>Primary Brand Theme Color</Label>
                  <Input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} placeholder="e.g. #6366f1" />
                </div>
                <div className="space-y-1.5">
                  <Label>Default Hashtags</Label>
                  <Input value={brandHashtags} onChange={(e) => setBrandHashtags(e.target.value)} placeholder="e.g. #marketing #growth" />
                </div>
                <Button onClick={handleUpdateBrand}>Save Brand Rules</Button>
              </CardContent>
            </Card>
          )}

          {active === "subscription" && (
            <>
              {/* Subscription Plan details */}
              <Card className="border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent">
                <CardContent className="p-6">
                  {isLoadingBilling ? (
                    <div className="flex h-20 items-center justify-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin" /> Loading billing summary...
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                            <Crown className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-display text-lg font-bold">
                                {billingData?.subscription?.planName || "Free Plan"}
                              </p>
                              <Badge className={billingData?.subscription?.status === "active" ? "bg-success/20 text-success border-0" : "bg-warning/20 text-warning border-0"}>
                                <Sparkles className="mr-1 h-3 w-3" /> {billingData?.subscription?.status || "Active"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              INR {billingData?.subscription?.amount || 0}/{billingData?.subscription?.billingCycle || "month"} 
                              {billingData?.subscription?.nextBillingDate && ` · Renews ${new Date(billingData.subscription.nextBillingDate).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {billingData?.subscription?.planId !== "free" && (
                            <>
                              {billingData?.subscription?.status === "active" ? (
                                <Button variant="outline" size="sm" onClick={() => pauseSubscription()}>Pause Subscription</Button>
                              ) : billingData?.subscription?.status === "paused" ? (
                                <Button size="sm" onClick={() => resumeSubscription()}>Resume Subscription</Button>
                              ) : null}
                              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => cancelSubscription()}>
                                Cancel Subscription
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Usage details metrics progress bars */}
                      <div className="mt-6 border-t border-border pt-5 space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace Plan Limits Usage</h4>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>AI Requests</span>
                              <span>{billingData?.usage?.aiRequests?.used || 0} / {billingData?.usage?.aiRequests?.limit}</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${Math.min(100, ((billingData?.usage?.aiRequests?.used || 0) / (billingData?.usage?.aiRequests?.limit || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Campaigns count</span>
                              <span>{billingData?.usage?.campaigns?.used || 0} / {billingData?.usage?.campaigns?.limit}</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-chart-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, ((billingData?.usage?.campaigns?.used || 0) / (billingData?.usage?.campaigns?.limit || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Storage Used</span>
                              <span>{formatBytes(billingData?.usage?.storage?.used || 0)} / {formatBytes(billingData?.usage?.storage?.limit || 0)}</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-chart-4 rounded-full transition-all"
                                style={{ width: `${Math.min(100, ((billingData?.usage?.storage?.used || 0) / (billingData?.usage?.storage?.limit || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Pricing Cards Upgrade Options */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Subscription Plans</CardTitle>
                      <p className="text-xs text-muted-foreground">Select a pricing level to upgrade your workspace parameters.</p>
                    </div>
                    <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg">
                      <button onClick={() => setBillingCycle("monthly")} className={cn("px-2.5 py-1 text-xs font-medium rounded-md", billingCycle === "monthly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>Monthly</button>
                      <button onClick={() => setBillingCycle("yearly")} className={cn("px-2.5 py-1 text-xs font-medium rounded-md", billingCycle === "yearly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>Yearly</button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {pricingPlans.map((p) => {
                      const isCurrent = billingData?.subscription?.planId === p.id;
                      const displayPrice = billingCycle === "yearly" ? p.price * 10 : p.price;
                      return (
                        <div key={p.id} className={cn("flex flex-col justify-between rounded-xl border p-4 transition-all", isCurrent ? "border-primary bg-primary/[0.01]" : "border-border hover:shadow-soft")}>
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{p.name}</span>
                              {isCurrent && <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">Current</Badge>}
                            </div>
                            <div className="mt-2.5 flex items-baseline gap-1">
                              <span className="text-2xl font-bold">INR {displayPrice}</span>
                              <span className="text-xs text-muted-foreground">/{billingCycle === "yearly" ? "yr" : "mo"}</span>
                            </div>
                            <ul className="mt-4 space-y-2 text-xs text-muted-foreground border-t border-border pt-3">
                              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary shrink-0" /> {p.aiLimit} AI Requests</li>
                              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary shrink-0" /> {p.campaigns} Campaigns limit</li>
                              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary shrink-0" /> {p.team} Team seats</li>
                              <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary shrink-0" /> {formatBytes(p.storage)} Storage capacity</li>
                            </ul>
                          </div>
                          <div className="mt-5 space-y-2">
                            <Button
                              onClick={() => handleRazorpayCheckout(p.id)}
                              disabled={isCurrent || isProcessingPayment}
                              size="sm"
                              className="w-full"
                              variant={isCurrent ? "outline" : "default"}
                            >
                              {isCurrent ? "Active Plan" : `Upgrade to ${p.name}`}
                            </Button>
                            {/* Admin Sandbox Manual Upgrade Fallback */}
                            {!isCurrent && (
                              <button
                                onClick={() => handleManualCheckout(p.id)}
                                disabled={isProcessingPayment}
                                className="w-full text-center text-[10px] text-muted-foreground underline hover:text-foreground"
                              >
                                (Sandbox Manual Upgrade)
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Billing Customer Profile Details form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Billing & GST Profile Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Billing Contact Name</Label>
                      <Input value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="e.g. John Doe" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Billing Email address</Label>
                      <Input value={custEmail} onChange={(e) => setCustEmail(e.target.value)} placeholder="e.g. billing@company.com" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Contact Phone Number</Label>
                      <Input value={custPhone} onChange={(e) => setCustPhone(e.target.value)} placeholder="e.g. +91 99999 99999" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Company Corporate Name</Label>
                      <Input value={custCompany} onChange={(e) => setCustCompany(e.target.value)} placeholder="e.g. Acme Corp Inc" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>GST Identification Number (GSTIN)</Label>
                    <Input value={custGST} onChange={(e) => setCustGST(e.target.value)} placeholder="e.g. 29GGGGG1314R1Z1" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Billing Address</Label>
                    <Input value={custAddress} onChange={(e) => setCustAddress(e.target.value)} placeholder="e.g. 101 Corporate Suites, Silicon Valley" />
                  </div>
                  <Button onClick={handleSaveBillingDetails}>Save Billing Profile</Button>
                </CardContent>
              </Card>

              {/* Billing History logs */}
              <Card>
                <CardHeader><CardTitle className="text-base">Billing History & Invoice Downloads</CardTitle></CardHeader>
                <CardContent>
                  {billingData?.invoices?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                      <AlertTriangle className="h-8 w-8 mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">No billing history found</p>
                      <p className="text-xs">Your payment receipt logs and downloadable invoices will display here once transactions occur.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(billingData?.invoices || []).map((inv: any) => (
                        <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{inv.invoiceNumber}</p>
                            <p className="text-xs text-muted-foreground">{new Date(inv.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-foreground">INR {inv.total}</span>
                            <a
                              href={`http://localhost:5000${inv.downloadUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-secondary hover:bg-secondary/80 px-2 py-1 text-xs text-secondary-foreground transition-colors"
                            >
                              <Download className="h-3 w-3" /> Invoice
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

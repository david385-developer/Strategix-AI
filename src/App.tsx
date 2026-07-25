import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";

const LandingPage = lazy(() => import("@/pages/landing"));
const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password"));
const OnboardingPage = lazy(() => import("@/pages/onboarding/onboarding"));
const DashboardPage = lazy(() => import("@/pages/app/dashboard"));
const CampaignsPage = lazy(() => import("@/pages/app/campaigns"));
const CampaignDetailPage = lazy(() => import("@/pages/app/campaign-detail"));
const NewCampaignPage = lazy(() => import("@/pages/app/new-campaign"));
const ContentStudioPage = lazy(() => import("@/pages/app/content-studio"));
const CalendarPage = lazy(() => import("@/pages/app/calendar"));
const AnalyticsPage = lazy(() => import("@/pages/app/analytics"));
const AIAssistantPage = lazy(() => import("@/pages/app/ai-assistant-page"));
const BrandPage = lazy(() => import("@/pages/app/brand"));
const TeamPage = lazy(() => import("@/pages/app/team"));
const NotificationsPage = lazy(() => import("@/pages/app/notifications"));
const SettingsPage = lazy(() => import("@/pages/app/settings"));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="campaigns/new" element={<NewCampaignPage />} />
              <Route path="campaigns/:id" element={<CampaignDetailPage />} />
              <Route path="content-studio" element={<ContentStudioPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="ai-assistant" element={<AIAssistantPage />} />
              <Route path="brand" element={<BrandPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

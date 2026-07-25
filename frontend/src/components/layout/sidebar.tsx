import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Megaphone, SquarePen as PenSquare, CalendarDays, ChartBar as BarChart3, Sparkles, Palette, Users, Bell, Settings, ChevronLeft, ChevronDown, Zap, Plus, CircleHelp } from "lucide-react";
import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspace";
import { useNotifications } from "@/hooks/use-notifications";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/app/content-studio", label: "Content Studio", icon: PenSquare },
  { to: "/app/calendar", label: "Content Calendar", icon: CalendarDays },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/app/brand", label: "Brand Profile", icon: Palette },
  { to: "/app/team", label: "Team", icon: Users },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const mobileOpen = useUIStore((s) => s.sidebarOpen);
  const setMobileOpen = useUIStore((s) => s.setSidebarOpen);
  const location = useLocation();
  const [workspaceOpen, setWorkspaceOpen] = React.useState(false);

  const { user } = useAuth();
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspace();
  const { notifications } = useNotifications();
  
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const content = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo / Workspace */}
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
        <button
          onClick={() => setWorkspaceOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 text-left transition-colors hover:bg-sidebar-accent"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-4 text-primary-foreground shadow-glow">
            <Zap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-sm font-semibold">{activeWorkspace?.name || user?.name || "Workspace"}</p>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/50" />
              </div>
              <p className="truncate text-xs text-sidebar-foreground/50 capitalize">{user?.role || "Member"}</p>
            </div>
          )}
        </button>
        <AnimatePresence>
          {workspaceOpen && !collapsed && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute left-3 top-16 z-50 w-60 rounded-xl border border-sidebar-border bg-popover p-2 text-popover-foreground shadow-elevated"
            >
              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Workspaces</p>
              {workspaces.map((w: any, i: number) => {
                const isActive = activeWorkspace?.id === w.id || activeWorkspace?._id === w._id;
                return (
                  <button
                    key={w.id || w._id}
                    onClick={() => {
                      switchWorkspace(w.id || w._id);
                      setWorkspaceOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <div className={cn("h-6 w-6 rounded-md", isActive ? "bg-primary" : "bg-muted")} />
                    <span className={cn(isActive && "font-medium")}>{w.name}</span>
                  </button>
                );
              })}
              <div className="my-1 h-px bg-border" />
              <button
                onClick={() => {
                  setWorkspaceOpen(false);
                  // navigate to settings to create workspace, or we can open a modal if requested!
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-primary transition-colors hover:bg-primary/5"
              >
                <Plus className="h-4 w-4" /> New workspace
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3 scrollbar-thin">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          const isNotifications = item.to === "/app/notifications";
          const badge = isNotifications ? unreadCount : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                />
              )}
              <item.icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && badge > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Upgrade card */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="rounded-xl bg-gradient-to-br from-primary/20 to-chart-4/20 p-3.5 ring-1 ring-inset ring-primary/20">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-sidebar-foreground">Upgrade to Pro</p>
            </div>
            <p className="mb-3 text-xs text-sidebar-foreground/60">
              Unlock unlimited AI generations and advanced analytics.
            </p>
            <Button size="sm" className="w-full">
              Upgrade
            </Button>
          </div>
        </div>
      )}

      {/* Collapse toggle (desktop) */}
      <div className="hidden border-t border-sidebar-border px-3 py-2.5 lg:block">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>

      {/* Help (bottom) */}
      {collapsed && (
        <div className="hidden border-t border-sidebar-border px-3 py-2.5 lg:block">
          <button className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sidebar-foreground/60 hover:bg-sidebar-accent">
            <CircleHelp className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden shrink-0 transition-[width] duration-300 lg:block",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <div className="fixed inset-y-0 left-0 z-30 h-full">{content}</div>
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[260px] lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

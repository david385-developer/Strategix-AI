import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu, Sun, Moon, Plus, Sparkles, ChevronDown, Command, Settings, LogOut, User, CircleHelp as HelpCircle } from "lucide-react";
import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { user, notifications } from "@/lib/data";

export function Topbar() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const setAiOpen = useUIStore((s) => s.setAiAssistantOpen);
  const navigate = useNavigate();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [searchFocused, setSearchFocused] = React.useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-xl sm:px-6">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Workspace name (mobile) */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border bg-muted/40 px-3 transition-all",
            searchFocused ? "border-primary ring-2 ring-ring/20 bg-card" : "border-transparent"
          )}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns, content, people…"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden items-center gap-0.5 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* AI Quick Action */}
        <Button
          variant="default"
          size="sm"
          className="hidden md:inline-flex"
          onClick={() => setAiOpen(true)}
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden lg:inline">Ask AI</span>
        </Button>

        {/* New */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:inline-flex"
          onClick={() => navigate("/app/campaigns/new")}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden lg:inline">New Campaign</span>
        </Button>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate("/app/notifications")}
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-tight text-foreground">{user.name}</p>
                <p className="text-xs leading-tight text-muted-foreground">{user.workspace}</p>
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2 normal-case">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-primary to-chart-4 text-primary-foreground text-[10px]">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/app/settings")}>
              <User className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/app/settings")}>
              <Settings className="h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="h-4 w-4" /> Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => navigate("/")}
            >
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

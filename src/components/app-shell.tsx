import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Command,
  ListTodo,
  Moon,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { userName } from "@/data/seed";

const NAV: { to: string; label: string; icon: LucideIcon; tint: string; bg: string }[] = [
  { to: "/", label: "Today", icon: CalendarDays, tint: "text-accent-amber", bg: "bg-accent-amber/12" },
  { to: "/tasks", label: "Tasks", icon: ListTodo, tint: "text-accent-blue", bg: "bg-accent-blue/12" },
  { to: "/notes", label: "Notes", icon: NotebookPen, tint: "text-accent-green", bg: "bg-accent-green/12" },
  { to: "/chat", label: "AI Chat", icon: Sparkles, tint: "text-accent-violet", bg: "bg-accent-violet/12" },
  { to: "/settings", label: "Settings", icon: Settings2, tint: "text-accent-teal", bg: "bg-accent-teal/12" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { setPaletteOpen, theme, toggleTheme, tasks, sidebarCollapsed, toggleSidebar } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const openCount = tasks.filter((t) => !t.done).length;

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop / iPad sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar py-4 transition-[width] duration-200 md:flex",
          sidebarCollapsed ? "w-[64px] items-center px-2" : "w-[236px] px-3",
        )}
      >
        <div className={cn("flex items-center gap-2.5 pb-5", sidebarCollapsed ? "justify-center" : "px-2")}>
          <span className="grid size-7 shrink-0 place-items-center rounded-[9px] bg-gradient-to-br from-accent-violet to-primary text-primary-foreground">
            <CheckCircle2 className="size-4" aria-hidden />
          </span>
          {!sidebarCollapsed ? <span className="text-[15px] font-semibold tracking-tight">Daylight</span> : null}
        </div>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label="Search and commands"
          className={cn(
            "mb-4 flex items-center gap-2 rounded-lg border border-sidebar-border bg-surface text-sm text-muted-foreground transition-colors hover:border-border-strong",
            sidebarCollapsed ? "size-9 justify-center p-0" : "w-full px-2.5 py-2",
          )}
        >
          <Search className="size-4 shrink-0" aria-hidden />
          {!sidebarCollapsed ? (
            <>
              <span className="flex-1 text-left">Search</span>
              <kbd className="flex items-center gap-0.5 rounded border border-border px-1 py-0.5 text-[10px] text-muted-foreground">
                <Command className="size-2.5" aria-hidden />K
              </kbd>
            </>
          ) : null}
        </button>

        <nav className="flex w-full flex-1 flex-col gap-0.5" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon, tint, bg }) => (
            <Link
              key={to}
              to={to}
              title={sidebarCollapsed ? label : undefined}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg text-sm transition-colors",
                sidebarCollapsed ? "justify-center px-0 py-2" : "px-2.5 py-[7px]",
                isActive(to)
                  ? cn(bg, "font-medium text-sidebar-accent-foreground")
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              <Icon className={cn("size-[17px] shrink-0", isActive(to) ? tint : "text-muted-foreground")} aria-hidden />
              {!sidebarCollapsed ? (
                <>
                  <span className="flex-1">{label}</span>
                  {to === "/tasks" && openCount > 0 ? (
                    <span className="tnum rounded-md bg-accent-blue/12 px-1.5 text-[12px] text-accent-blue">{openCount}</span>
                  ) : null}
                </>
              ) : null}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "mt-4 flex items-center gap-2 rounded-lg py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
            sidebarCollapsed ? "justify-center px-0" : "px-2.5",
          )}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="size-4" aria-hidden /> : <PanelLeftClose className="size-4" aria-hidden />}
          {!sidebarCollapsed ? "Collapse" : null}
        </button>

        <div
          className={cn(
            "mt-2 flex items-center gap-2 border-t border-sidebar-border pt-3",
            sidebarCollapsed && "flex-col gap-2",
          )}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-teal/25 to-accent-violet/25 text-[12px] font-semibold">
            {userName.slice(0, 1)}
          </span>
          {!sidebarCollapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{userName}</p>
              <p className="truncate text-[11px] text-muted-foreground">Personal plan</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            {theme === "light" ? <Moon className="size-4" aria-hidden /> : <Sun className="size-4" aria-hidden />}
          </button>
        </div>
      </aside>


      <main className="flex min-w-0 flex-1 flex-col pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">{children}</main>

      {/* iPhone bottom tab bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[10.5px] transition-colors",
              isActive(to) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-[19px]" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  const { setPaletteOpen, theme, toggleTheme } = useStore();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-7">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[17px] font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="truncate text-[12.5px] text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        aria-label="Search and commands"
        className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground md:hidden"
      >
        <Search className="size-[18px]" aria-hidden />
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground md:hidden"
      >
        {theme === "light" ? <Moon className="size-[18px]" aria-hidden /> : <Sun className="size-[18px]" aria-hidden />}
      </button>
    </header>
  );
}

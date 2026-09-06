import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckCircle2,
  Command,
  ListTodo,
  Moon,
  NotebookPen,
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

const NAV: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Today", icon: CalendarDays },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/chat", label: "AI Chat", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings2 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { setPaletteOpen, theme, toggleTheme, tasks } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const openCount = tasks.filter((t) => !t.done).length;

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop / iPad sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 md:flex">
        <div className="flex items-center gap-2.5 px-2 pb-5">
          <span className="grid size-7 place-items-center rounded-[9px] bg-primary text-primary-foreground">
            <CheckCircle2 className="size-4" aria-hidden />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Daylight</span>
        </div>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="mb-4 flex items-center gap-2 rounded-lg border border-sidebar-border bg-surface px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:border-border-strong"
        >
          <Search className="size-4" aria-hidden />
          <span className="flex-1 text-left">Search</span>
          <kbd className="flex items-center gap-0.5 rounded border border-border px-1 py-0.5 text-[10px] text-muted-foreground">
            <Command className="size-2.5" aria-hidden />K
          </kbd>
        </button>

        <nav className="flex flex-1 flex-col gap-0.5" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-sm transition-colors",
                isActive(to)
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              <Icon className={cn("size-[17px]", isActive(to) ? "text-primary" : "text-muted-foreground")} aria-hidden />
              <span className="flex-1">{label}</span>
              {to === "/tasks" && openCount > 0 ? (
                <span className="tnum text-[12px] text-muted-foreground">{openCount}</span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="mt-4 flex items-center gap-2 border-t border-sidebar-border pt-3">
          <span className="grid size-7 place-items-center rounded-full bg-surface-2 text-[12px] font-semibold">
            {userName.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{userName}</p>
            <p className="truncate text-[11px] text-muted-foreground">Personal plan</p>
          </div>
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

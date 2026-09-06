import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, LogOut, Moon, Sun } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/app-shell";
import { userName } from "@/data/seed";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Kamkazi" },
      { name: "description", content: "Appearance, assistant behaviour, task defaults, notebooks, calendars, weather and notifications." },
      { property: "og:title", content: "Settings — Kamkazi" },
      { property: "og:description", content: "Appearance, assistant behaviour, task defaults, notebooks, calendars, weather and notifications." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSetting, theme, toggleTheme, lists, notebooks } = useStore();
  const [open, setOpen] = useState<string | null>("General");

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Settings" subtitle="Preferences for this workspace" />
      <div className="mx-auto w-full max-w-[680px] px-4 py-6 md:px-6">
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5">
          <span className="grid size-10 place-items-center rounded-full bg-surface-2 text-[15px] font-semibold">
            {userName.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium">{userName}</p>
            <p className="text-[13px] text-muted-foreground">shantanu@example.com · Personal plan</p>
          </div>
          <button
            type="button"
            onClick={() => toast("Sign-in comes with the full version")}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[13px] transition-colors hover:border-border-strong"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </div>

        <Group label="General" open={open} setOpen={setOpen}>
          <Row label="Appearance" hint={theme === "light" ? "Light" : "Dark"}>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[13px] transition-colors hover:border-border-strong"
            >
              {theme === "light" ? <Moon className="size-4" aria-hidden /> : <Sun className="size-4" aria-hidden />}
              Switch
            </button>
          </Row>
          <Row label="Language">
            <Select value="English" options={["English", "हिन्दी", "Español"]} onChange={() => toast("More languages coming soon")} />
          </Row>
          <Row label="Start page">
            <Select
              value={settings.startPage}
              options={["Today", "Tasks", "Notes", "AI Chat"]}
              onChange={(v) => updateSetting("startPage", v)}
            />
          </Row>
          <Row label="Week starts on">
            <Select value="Monday" options={["Sunday", "Monday"]} onChange={() => undefined} />
          </Row>
        </Group>

        <Group label="AI" open={open} setOpen={setOpen}>
          <Row label="Personalised responses" hint="Uses your tasks, notes and schedule for context">
            <Toggle checked={settings.aiPersonalisation} onChange={(v) => updateSetting("aiPersonalisation", v)} label="Personalised responses" />
          </Row>
          <Row label="Model" hint="Chosen automatically for speed and quality">
            <Select value="Balanced" options={["Fast", "Balanced", "Thorough"]} onChange={() => undefined} />
          </Row>
          <Row label="Memory" hint="What the assistant remembers between chats">
            <button type="button" onClick={() => toast("Memory controls come with the full version")} className="text-[13px] text-primary">
              Manage
            </button>
          </Row>
        </Group>

        <Group label="Tasks" open={open} setOpen={setOpen}>
          <Row label="Default list">
            <Select
              value={lists.find((l) => l.id === settings.defaultListId)?.name ?? "Inbox"}
              options={lists.map((l) => l.name)}
              onChange={(v) => updateSetting("defaultListId", lists.find((l) => l.name === v)?.id ?? "inbox")}
            />
          </Row>
          <Row label="Default reminder">
            <Select value="15 minutes before" options={["None", "At time", "15 minutes before", "1 hour before"]} onChange={() => undefined} />
          </Row>
          <Row label="Move completed to bottom">
            <Toggle checked onChange={() => undefined} label="Move completed to bottom" />
          </Row>
        </Group>

        <Group label="Notes" open={open} setOpen={setOpen}>
          <Row label="Default notebook">
            <Select
              value={notebooks.find((n) => n.id === settings.defaultNotebookId)?.name ?? "Personal"}
              options={notebooks.map((n) => n.name)}
              onChange={(v) => updateSetting("defaultNotebookId", notebooks.find((n) => n.name === v)?.id ?? "personal")}
            />
          </Row>
          <Row label="Markdown shortcuts" hint="Type ## or - to format as you write">
            <Toggle checked={settings.markdownShortcuts} onChange={(v) => updateSetting("markdownShortcuts", v)} label="Markdown shortcuts" />
          </Row>
          <Row label="Editor width">
            <Select value="Comfortable" options={["Narrow", "Comfortable", "Wide"]} onChange={() => undefined} />
          </Row>
        </Group>

        <Group label="Calendar" open={open} setOpen={setOpen}>
          <Row label="Connected calendars" hint="Work · Personal">
            <button type="button" onClick={() => toast("Calendar connections come with the full version")} className="text-[13px] text-primary">
              Connect
            </button>
          </Row>
          <Row label="Default calendar">
            <Select value="Work" options={["Work", "Personal"]} onChange={() => undefined} />
          </Row>
          <Row label="Show declined events">
            <Toggle checked={false} onChange={() => undefined} label="Show declined events" />
          </Row>
        </Group>

        <Group label="Weather" open={open} setOpen={setOpen}>
          <Row label="Location">
            <input
              value={settings.weatherLocation}
              onChange={(e) => updateSetting("weatherLocation", e.target.value)}
              aria-label="Weather location"
              className="w-36 rounded-lg bg-surface-2 px-2 py-1.5 text-right text-[13px] outline-none"
            />
          </Row>
          <Row label="Units">
            <Select value={settings.units === "C" ? "Celsius" : "Fahrenheit"} options={["Celsius", "Fahrenheit"]} onChange={(v) => updateSetting("units", v === "Celsius" ? "C" : "F")} />
          </Row>
        </Group>

        <Group label="Notifications" open={open} setOpen={setOpen}>
          <Row label="Task reminders">
            <Toggle checked={settings.taskReminders} onChange={(v) => updateSetting("taskReminders", v)} label="Task reminders" />
          </Row>
          <Row label="Daily briefing" hint="Every morning at 7:30">
            <Toggle checked={settings.dailyBriefing} onChange={(v) => updateSetting("dailyBriefing", v)} label="Daily briefing" />
          </Row>
          <Row label="Event alerts">
            <Toggle checked={settings.eventAlerts} onChange={(v) => updateSetting("eventAlerts", v)} label="Event alerts" />
          </Row>
        </Group>

        <Group label="Integrations" open={open} setOpen={setOpen}>
          {["Google Calendar", "Apple Calendar", "Slack", "Email forwarding"].map((name) => (
            <Row key={name} label={name} hint="Not connected">
              <button type="button" onClick={() => toast(`${name} comes with the full version`)} className="text-[13px] text-primary">
                Connect
              </button>
            </Row>
          ))}
        </Group>

        <Group label="Account" open={open} setOpen={setOpen}>
          <Row label="Profile" hint={userName}>
            <button type="button" onClick={() => toast("Profile editing comes with the full version")} className="text-[13px] text-primary">
              Edit
            </button>
          </Row>
          <Row label="Subscription" hint="Personal plan">
            <button type="button" onClick={() => toast("Plans come with the full version")} className="text-[13px] text-primary">
              Manage
            </button>
          </Row>
          <Row label="Data and privacy">
            <button type="button" onClick={() => toast("Export comes with the full version")} className="text-[13px] text-primary">
              Export
            </button>
          </Row>
        </Group>

        <div className="h-10" />
      </div>
    </div>
  );
}

function Group({
  label,
  open,
  setOpen,
  children,
}: {
  label: string;
  open: string | null;
  setOpen: (v: string | null) => void;
  children: ReactNode;
}) {
  const expanded = open === label;
  return (
    <section className="mb-2 overflow-hidden rounded-xl border border-border bg-surface">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setOpen(expanded ? null : label)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-[14.5px] font-medium transition-colors hover:bg-surface-2/60"
      >
        {label}
        <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-90")} aria-hidden />
      </button>
      {expanded ? <div className="border-t border-border px-4 py-1">{children}</div> : null}
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-[14px]">{label}</p>
        {hint ? <p className="text-[12.5px] text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={value}
      className="rounded-lg bg-surface-2 px-2 py-1.5 text-[13px] outline-none"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-10 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-border-strong",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-surface shadow-panel transition-all",
          checked ? "left-[18px]" : "left-0.5",
        )}
      />
    </button>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Cloud,
  ListPlus,
  MessageSquarePlus,
  Plus,
  Sparkles,
  StickyNote,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { TODAY, briefing, userName, weather, type Task } from "@/data/seed";
import { formatDuration, formatTime, greeting, longDate, minutesOf, relativeDate } from "@/lib/format";
import { TaskCheckbox, EmptyState } from "@/components/primitives";
import { TaskDetail } from "@/components/task-detail";
import { cn } from "@/lib/utils";

export function TodayScreen() {
  const { tasks, events, setPaletteOpen, addTask, addNote, addConversation, settings } = useStore();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quickTask, setQuickTask] = useState("");
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const nowMin = mounted ? now.getHours() * 60 + now.getMinutes() : -1;

  const selected = tasks.find((t) => t.id === selectedId) ?? null;

  const todaysTasks = tasks.filter((t) => t.dueDate && t.dueDate <= TODAY);
  const overdue = todaysTasks.filter((t) => !t.done && t.dueDate && t.dueDate < TODAY);
  const untimed = todaysTasks.filter((t) => !t.done && t.dueDate === TODAY && !t.dueTime);
  const allDay = events.filter((e) => e.allDay);

  const timeline = useMemo(() => {
    const entries: { key: string; min: number; node: "event" | "task"; event?: (typeof events)[number]; task?: Task }[] = [];
    for (const e of events) if (!e.allDay) entries.push({ key: e.id, min: minutesOf(e.start), node: "event", event: e });
    for (const t of todaysTasks) if (t.dueTime && t.dueDate === TODAY) entries.push({ key: t.id, min: minutesOf(t.dueTime), node: "task", task: t });
    return entries.sort((a, b) => a.min - b.min);
  }, [events, todaysTasks]);

  const nextUp = mounted ? timeline.find((e) => e.min > nowMin) : undefined;

  return (
    <div className="flex min-h-screen">
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[760px] px-4 py-7 md:px-8 md:py-10">
          {/* header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-extrabold leading-[1.1] tracking-tight md:text-[36px]">
                <span suppressHydrationWarning>{greeting(now.getHours())}</span>, {userName}
              </h1>
              <p className="mt-1.5 text-[14.5px] font-medium text-muted-foreground">{longDate(TODAY)}</p>

            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-muted-foreground shadow-[var(--shadow-panel)]">
              {weather.condition.toLowerCase().includes("cloud") ? (
                <Cloud className="size-[18px] text-accent-teal" aria-hidden />
              ) : (
                <Sun className="size-[18px] text-accent-amber" aria-hidden />
              )}
              <span className="num text-[15px] font-bold text-foreground">{weather.temp}°</span>
              <span className="text-[13px] font-medium">{weather.condition}</span>
              <span className="num text-[13px]">
                H {weather.high}° · L {weather.low}°
              </span>
            </div>

          </div>

          {/* briefing */}
          {settings.dailyBriefing ? (
            <section
              className="gradient-primary animate-fade-up mt-7 rounded-[var(--radius-xl)] p-5 text-primary-foreground shadow-[var(--shadow-3d)]"
              aria-label="Daily briefing"
            >
              <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] opacity-80">
                <Sparkles className="size-3.5" aria-hidden />
                Daily briefing
              </div>
              <p className="text-[16px] font-medium leading-relaxed text-balance-tight">{briefing}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {["Plan my day", "Ask about today", "Prioritize my tasks"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      const id = addConversation();
                      void navigate({ to: "/chat/$chatId", params: { chatId: id } });
                    }}
                    className="tap rounded-full border border-primary-foreground/25 bg-primary-foreground/12 px-3 py-1.5 text-[13px] font-semibold backdrop-blur transition-colors hover:bg-primary-foreground/20"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {/* quick capture */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!quickTask.trim()) return;
                addTask(quickTask.trim(), settings.defaultListId, TODAY);
                setQuickTask("");
              }}
              className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5 shadow-[var(--shadow-panel)] focus-within:border-primary/40"
            >
              <Plus className="size-[17px] text-primary" strokeWidth={2.4} aria-hidden />
              <input
                value={quickTask}
                onChange={(e) => setQuickTask(e.target.value)}
                placeholder="Add a task for today"
                aria-label="Add a task for today"
                className="w-full bg-transparent text-[14px] font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground"
              />
            </form>
            <button
              type="button"
              onClick={() => {
                const id = addNote(settings.defaultNotebookId);
                void navigate({ to: "/notes/$noteId", params: { noteId: id } });
              }}
              className="tap hidden items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2.5 text-[13px] font-semibold shadow-[var(--shadow-panel)] sm:flex"
            >
              <StickyNote className="size-4 text-accent-amber" aria-hidden />
              New note
            </button>
            <button
              type="button"
              onClick={() => {
                const id = addConversation();
                void navigate({ to: "/chat/$chatId", params: { chatId: id } });
              }}
              className="tap hidden items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2.5 text-[13px] font-semibold shadow-[var(--shadow-panel)] sm:flex"
            >
              <Sparkles className="size-4 text-accent-violet" aria-hidden />
              Ask AI
            </button>
          </div>


          {/* overdue */}
          {overdue.length ? (
            <section className="mt-7" aria-label="Overdue">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-destructive">
                Overdue · {overdue.length}
              </p>
              <div className="space-y-0.5">
                {overdue.map((t) => (
                  <AgendaTask key={t.id} task={t} onSelect={() => setSelectedId(t.id)} overdue />
                ))}
              </div>
            </section>
          ) : null}

          {/* all day */}
          {allDay.length ? (
            <section className="mt-7" aria-label="All day">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">All day</p>
              {allDay.map((e) => (
                <div key={e.id} className="rounded-lg border border-accent-teal/20 bg-accent-teal/10 px-3 py-2 text-[14px]">
                  {e.title}
                </div>
              ))}
            </section>
          ) : null}

          {/* agenda */}
          <section className="mt-7" aria-label="Today's agenda">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-[16px] font-bold tracking-tight">Today's agenda</h2>
              {nextUp ? (
                <p className="truncate text-[12.5px] font-medium text-muted-foreground">
                  Next: {nextUp.event?.title ?? nextUp.task?.title} at {formatTime(nextUp.event?.start ?? nextUp.task?.dueTime)}
                </p>
              ) : (
                <p className="text-[12.5px] font-medium text-muted-foreground">Nothing left on the calendar</p>
              )}
            </div>

            {timeline.length === 0 ? (
              <EmptyState
                icon={<ListPlus className="size-5" aria-hidden />}
                title="A completely open day"
                description="No meetings and nothing scheduled. Good time for deep work."
              />
            ) : (
              <div className="panel relative px-2 py-2">

                {timeline.map((entry, idx) => {
                  const prev = timeline[idx - 1];
                  const gap = prev ? entry.min - (prev.min + (prev.event?.durationMin ?? 0)) : 0;
                  const showNowLine =
                    mounted && (prev ? nowMin > prev.min && nowMin <= entry.min : nowMin <= entry.min);

                  return (
                    <div key={entry.key}>
                      {gap >= 90 ? (
                        <div className="flex items-center gap-3 py-2 pl-[68px] text-[12px] text-muted-foreground">
                          <span className="h-px flex-1 bg-border" />
                          {Math.round(gap / 60)} hrs open
                          <span className="h-px flex-1 bg-border" />
                        </div>
                      ) : null}
                      {showNowLine ? (
                        <div className="flex items-center gap-2 py-1.5" aria-label="Current time">
                          <span className="tnum w-[60px] shrink-0 text-right text-[11.5px] font-medium text-destructive">
                            {formatTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`)}
                          </span>
                          <span className="size-1.5 shrink-0 rounded-full bg-destructive" />
                          <span className="h-px flex-1 bg-destructive/40" />
                        </div>
                      ) : null}
                      {entry.node === "event" && entry.event ? (
                        <div className="group flex gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-surface-2/60">
                          <span className="tnum w-[60px] shrink-0 pt-0.5 text-right text-[12.5px] text-muted-foreground">
                            {formatTime(entry.event.start)}
                          </span>
                          <span
                            className="mt-1 w-[3px] shrink-0 rounded-full"
                            style={{ backgroundColor: entry.event.calendar === "Work" ? "var(--color-accent-blue)" : entry.event.calendar === "Personal" ? "var(--color-accent-green)" : "var(--color-accent-amber)" }}
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14.5px] font-medium leading-snug">{entry.event.title}</span>
                            <span className="block text-[12.5px] text-muted-foreground">
                              {[formatDuration(entry.event.durationMin), entry.event.location, entry.event.calendar]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                        </div>
                      ) : entry.task ? (
                        <AgendaTask task={entry.task} onSelect={() => setSelectedId(entry.task!.id)} showTime />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* untimed tasks */}
          {untimed.length ? (
            <section className="mt-8" aria-label="Anytime today">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-[15px] font-semibold tracking-tight">Anytime today</h2>
                <Link to="/tasks" className="flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground">
                  All tasks <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
              <div className="space-y-0.5">
                {untimed.map((t) => (
                  <AgendaTask key={t.id} task={t} onSelect={() => setSelectedId(t.id)} />
                ))}
              </div>
            </section>
          ) : null}

          <div className="h-10" />
        </div>
      </div>

      {/* detail panel */}
      {selected ? (
        <>
          <div className="hidden w-[350px] shrink-0 border-l border-border xl:block">
            <div className="sticky top-0 h-screen">
              <TaskDetail task={selected} onClose={() => setSelectedId(null)} />
            </div>
          </div>
          <div className="fixed inset-0 z-40 xl:hidden">
            <button
              type="button"
              aria-label="Close task details"
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-foreground/20"
            />
            <div className="absolute inset-x-0 bottom-0 top-16 animate-in slide-in-from-bottom-6 overflow-hidden rounded-t-2xl border-t border-border bg-surface shadow-raised duration-200">
              <TaskDetail task={selected} onClose={() => setSelectedId(null)} />
            </div>
          </div>
        </>
      ) : null}

      {/* mobile quick capture */}
      <div className="fixed bottom-[calc(70px+env(safe-area-inset-bottom))] right-4 z-30 md:hidden">
        {capturing ? (
          <div className="mb-2 flex flex-col items-end gap-2">
            <CaptureAction
              label="New note"
              icon={<StickyNote className="size-4" aria-hidden />}
              onClick={() => {
                const id = addNote(settings.defaultNotebookId);
                setCapturing(false);
                void navigate({ to: "/notes/$noteId", params: { noteId: id } });
              }}
            />
            <CaptureAction
              label="Ask AI"
              icon={<Sparkles className="size-4 text-accent-violet" aria-hidden />}
              onClick={() => {
                const id = addConversation();
                setCapturing(false);
                void navigate({ to: "/chat/$chatId", params: { chatId: id } });
              }}
            />
            <CaptureAction
              label="Search"
              icon={<MessageSquarePlus className="size-4" aria-hidden />}
              onClick={() => {
                setCapturing(false);
                setPaletteOpen(true);
              }}
            />
          </div>
        ) : null}
        <button
          type="button"
          aria-label={capturing ? "Close quick capture" : "Quick capture"}
          aria-expanded={capturing}
          onClick={() => setCapturing((v) => !v)}
          className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-accent-violet to-primary text-primary-foreground shadow-raised transition-transform active:scale-95"
        >
          {capturing ? <X className="size-5" aria-hidden /> : <Plus className="size-5" aria-hidden />}
        </button>
      </div>
    </div>
  );
}

function CaptureAction({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-[13px] shadow-panel"
    >
      {icon}
      {label}
    </button>
  );
}

function AgendaTask({
  task,
  onSelect,
  showTime,
  overdue,
}: {
  task: Task;
  onSelect: () => void;
  showTime?: boolean;
  overdue?: boolean;
}) {
  const { toggleTask } = useStore();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="flex w-full cursor-default gap-3 rounded-lg px-1 py-2.5 text-left transition-colors hover:bg-surface-2/60"
    >
      <span className={cn("tnum w-[60px] shrink-0 pt-0.5 text-right text-[12.5px]", overdue ? "text-destructive" : "text-muted-foreground")}>
        {showTime ? formatTime(task.dueTime) : overdue ? relativeDate(task.dueDate) : ""}
      </span>
      <TaskCheckbox done={task.done} priority={task.priority} onToggle={() => toggleTask(task.id)} label={task.title} />
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[14.5px] leading-snug", task.done && "text-muted-foreground line-through")}>{task.title}</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Task{task.dueTime ? ` · Due ${formatTime(task.dueTime)}` : ""}
          {task.priority === "high" ? " · High priority" : ""}
        </span>
      </span>
    </div>
  );
}

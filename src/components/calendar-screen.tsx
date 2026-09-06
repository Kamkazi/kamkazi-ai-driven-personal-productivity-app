import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { TODAY, datedEvents, type Task } from "@/data/seed";
import { EmptyState, TaskCheckbox } from "@/components/primitives";
import { TaskDetail } from "@/components/task-detail";
import { formatDuration, formatTime, longDate, minutesOf } from "@/lib/format";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function CalendarScreen() {
  const { tasks } = useStore();
  const todayParts = TODAY.split("-").map(Number) as [number, number, number];
  const [cursor, setCursor] = useState({ year: todayParts[0], month: todayParts[1] - 1 });
  const [selected, setSelected] = useState(TODAY);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const days = useMemo(() => {
    const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
    const lead = first.getUTCDay();
    const count = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
    const cells: (string | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= count; d++) cells.push(iso(cursor.year, cursor.month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const dayTasks = (date: string) => tasks.filter((t) => t.dueDate === date);
  const dayEvents = (date: string) => datedEvents.filter((e) => e.date === date);

  const selectedTasks = dayTasks(selected);
  const selectedEvents = dayEvents(selected);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  const agenda = useMemo(() => {
    const items: { key: string; min: number; task?: Task; event?: (typeof datedEvents)[number] }[] = [];
    for (const e of selectedEvents) items.push({ key: e.id, min: e.allDay ? -1 : minutesOf(e.start), event: e });
    for (const t of selectedTasks) items.push({ key: t.id, min: t.dueTime ? minutesOf(t.dueTime) : 24 * 60, task: t });
    return items.sort((a, b) => a.min - b.min);
  }, [selectedEvents, selectedTasks]);

  const shift = (n: number) => {
    setCursor((c) => {
      const m = c.month + n;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };

  return (
    <div className="flex min-h-screen">
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-7 md:px-8 md:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-[24px] font-extrabold leading-tight tracking-tight md:text-[30px]">
                {MONTHS[cursor.month]} <span className="num text-muted-foreground">{cursor.year}</span>
              </h1>
              <p className="mt-1 truncate text-[13px] font-medium text-muted-foreground">{longDate(selected)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCursor({ year: todayParts[0], month: todayParts[1] - 1 });
                  setSelected(TODAY);
                }}
                className="tap rounded-full border border-border bg-card px-3.5 py-2 text-[13px] font-semibold shadow-[var(--shadow-panel)]"
              >
                Today
              </button>
              <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-[var(--shadow-panel)]">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => shift(-1)}
                  className="tap grid size-8 place-items-center rounded-full hover:bg-surface-2"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => shift(1)}
                  className="tap grid size-8 place-items-center rounded-full hover:bg-surface-2"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-8">
          {/* month grid */}
          <section className="panel animate-fade-up p-2.5 lg:sticky lg:top-6" aria-label="Month">
            <div className="grid grid-cols-7 pb-1">
              {WEEKDAYS.map((d, i) => (
                <span key={i} className="text-center text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((date, i) => {
                if (!date) return <span key={`e${i}`} />;
                const dayNum = Number(date.slice(8));
                const isToday = date === TODAY;
                const isSelected = date === selected;
                const evs = dayEvents(date);
                const tks = dayTasks(date);
                const dots = [
                  evs.some((e) => e.calendar === "Work") ? "bg-accent-blue" : null,
                  evs.some((e) => e.calendar === "Personal") ? "bg-accent-green" : null,
                  tks.length ? "bg-accent-amber" : null,
                ].filter(Boolean) as string[];

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelected(date)}
                    aria-pressed={isSelected}
                    aria-label={longDate(date)}
                    className="tap flex flex-col items-center gap-0.5 rounded-[12px] py-1 transition-colors hover:bg-surface-2/70"
                  >
                    <span
                      className={cn(
                        "num grid size-8 place-items-center rounded-full text-[13px] font-semibold",
                        isSelected
                          ? "gradient-primary text-primary-foreground shadow-[var(--shadow-3d)]"
                          : isToday
                            ? "text-primary"
                            : "text-foreground",
                      )}
                    >
                      {dayNum}
                    </span>
                    <span className="flex h-1.5 items-center gap-[3px]">
                      {dots.map((c, j) => (
                        <span key={j} className={cn("size-1 rounded-full", c)} aria-hidden />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>


          {/* agenda */}
          <section className="min-w-0" aria-label="Agenda for selected day">
            <h2 className="mb-3 text-[16px] font-bold tracking-tight">
              {selected === TODAY ? "Today" : longDate(selected)}
            </h2>
            {agenda.length === 0 ? (
              <EmptyState
                icon={<CalendarDays className="size-5" aria-hidden />}
                title="Nothing planned"
                description="This day is completely free."
              />
            ) : (
              <div className="panel px-2 py-2">
                {agenda.map((item) =>
                  item.event ? (
                    <div key={item.key} className="flex gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-surface-2/60">
                      <span className="tnum w-[60px] shrink-0 pt-0.5 text-right text-[12.5px] text-muted-foreground">
                        {item.event.allDay ? "All day" : formatTime(item.event.start)}
                      </span>
                      <span
                        className="mt-1 w-[3px] shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            item.event.calendar === "Work" ? "var(--color-accent-blue)" : "var(--color-accent-green)",
                        }}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-medium leading-snug">{item.event.title}</span>
                        <span className="block text-[12.5px] text-muted-foreground">
                          {[formatDuration(item.event.durationMin), item.event.location, item.event.calendar]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </div>
                  ) : item.task ? (
                    <CalendarTask key={item.key} task={item.task} onSelect={() => setSelectedTaskId(item.task!.id)} />
                  ) : null,
                )}
              </div>
            )}
          </section>

          <div className="h-10" />
        </div>
      </div>

      {selectedTask ? (
        <>
          <div className="hidden w-[350px] shrink-0 border-l border-border xl:block">
            <div className="sticky top-0 h-screen">
              <TaskDetail task={selectedTask} onClose={() => setSelectedTaskId(null)} />
            </div>
          </div>
          <div className="fixed inset-0 z-40 xl:hidden">
            <button
              type="button"
              aria-label="Close task details"
              onClick={() => setSelectedTaskId(null)}
              className="absolute inset-0 bg-foreground/20"
            />
            <div className="absolute inset-x-0 bottom-0 top-16 overflow-hidden rounded-t-2xl border-t border-border bg-surface shadow-raised">
              <TaskDetail task={selectedTask} onClose={() => setSelectedTaskId(null)} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function CalendarTask({ task, onSelect }: { task: Task; onSelect: () => void }) {
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
      <span className="tnum w-[60px] shrink-0 pt-0.5 text-right text-[12.5px] text-muted-foreground">
        {task.dueTime ? formatTime(task.dueTime) : ""}
      </span>
      <TaskCheckbox done={task.done} priority={task.priority} onToggle={() => toggleTask(task.id)} label={task.title} />
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[14.5px] leading-snug", task.done && "text-muted-foreground line-through")}>
          {task.title}
        </span>
        <span className="block text-[12.5px] text-muted-foreground">
          Task{task.priority === "high" ? " · High priority" : ""}
        </span>
      </span>
    </div>
  );
}

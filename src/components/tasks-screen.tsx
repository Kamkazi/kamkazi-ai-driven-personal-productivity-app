import { Link } from "@tanstack/react-router";
import { CheckCircle2, Inbox, Plus, ListTodo, Briefcase, Heart, ShoppingBag, CalendarClock, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { TODAY, dayOffset, type Task } from "@/data/seed";
import { relativeDate, isOverdue, formatTime } from "@/lib/format";
import { TaskCheckbox, EmptyState, SectionLabel } from "@/components/primitives";
import { TaskDetail } from "@/components/task-detail";
import { PageHeader } from "@/components/app-shell";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Inbox> = {
  inbox: Inbox,
  briefcase: Briefcase,
  heart: Heart,
  "shopping-bag": ShoppingBag,
  list: ListTodo,
};

export const SMART_LISTS = [
  { id: "today", name: "Today", icon: Sun },
  { id: "upcoming", name: "Upcoming", icon: CalendarClock },
];

export function TaskRow({
  task,
  selected,
  onSelect,
  showList = true,
}: {
  task: Task;
  selected?: boolean;
  onSelect: () => void;
  showList?: boolean;
}) {
  const { toggleTask, lists } = useStore();
  const list = lists.find((l) => l.id === task.listId);
  const overdue = isOverdue(task.dueDate) && !task.done;

  const meta = [
    task.dueDate ? `${relativeDate(task.dueDate)}${task.dueTime ? ` · ${formatTime(task.dueTime)}` : ""}` : "",
    showList && task.listId !== "inbox" ? list?.name ?? "" : "",
    task.subtasks.length ? `${task.subtasks.filter((s) => s.done).length}/${task.subtasks.length}` : "",
  ].filter(Boolean);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors",
        selected ? "bg-surface-2" : "hover:bg-surface-2/70",
      )}
    >
      <TaskCheckbox done={task.done} priority={task.priority} onToggle={() => toggleTask(task.id)} label={task.title} />
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-[14.5px] leading-snug", task.done && "text-muted-foreground line-through")}>
          {task.title}
        </span>
        {meta.length ? (
          <span className={cn("mt-0.5 block truncate text-[12.5px]", overdue ? "text-destructive" : "text-muted-foreground")}>
            {overdue ? "Overdue · " : ""}
            {meta.join(" · ")}
          </span>
        ) : null}
      </span>
      {task.priority === "high" && !task.done ? (
        <span className="mt-1 shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium text-destructive" aria-label="High priority">
          High
        </span>
      ) : null}
    </button>
  );
}

export function TasksScreen({ listId }: { listId: string }) {
  const { tasks, lists, addTask, addList } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);

  const title =
    SMART_LISTS.find((l) => l.id === listId)?.name ?? lists.find((l) => l.id === listId)?.name ?? "Tasks";

  const visible = useMemo(() => {
    if (listId === "today") return tasks.filter((t) => t.dueDate && t.dueDate <= TODAY);
    if (listId === "upcoming")
      return tasks.filter((t) => t.dueDate && t.dueDate > TODAY && t.dueDate <= dayOffset(14));
    return tasks.filter((t) => t.listId === listId);
  }, [tasks, listId]);

  const open = visible.filter((t) => !t.done);
  const done = visible.filter((t) => t.done);
  const selected = tasks.find((t) => t.id === selectedId) ?? null;

  const countFor = (id: string) => {
    if (id === "today") return tasks.filter((t) => !t.done && t.dueDate && t.dueDate <= TODAY).length;
    if (id === "upcoming") return tasks.filter((t) => !t.done && t.dueDate && t.dueDate > TODAY).length;
    return tasks.filter((t) => !t.done && t.listId === id).length;
  };

  return (
    <div className="flex min-h-screen">
      {/* list rail */}
      <div className="hidden w-[210px] shrink-0 flex-col border-r border-border bg-background px-3 py-4 lg:flex">
        <SectionLabel>Smart lists</SectionLabel>
        <div className="mb-5 flex flex-col gap-0.5">
          {SMART_LISTS.map(({ id, name, icon: Icon }) => (
            <RailLink key={id} to="/tasks/$listId" id={id} active={listId === id} count={countFor(id)}>
              <Icon className="size-4 text-muted-foreground" aria-hidden />
              {name}
            </RailLink>
          ))}
        </div>
        <SectionLabel>Lists</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {lists.map((l) => {
            const Icon = ICONS[l.icon] ?? ListTodo;
            return (
              <RailLink key={l.id} to="/tasks/$listId" id={l.id} active={listId === l.id} count={countFor(l.id)}>
                <Icon className="size-4" style={{ color: l.color }} aria-hidden />
                {l.name}
              </RailLink>
            );
          })}
        </div>
        {creatingList ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newListName.trim()) addList(newListName.trim());
              setNewListName("");
              setCreatingList(false);
            }}
            className="mt-1 px-2.5"
          >
            <input
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onBlur={() => setCreatingList(false)}
              placeholder="List name"
              aria-label="New list name"
              className="w-full bg-transparent py-1 text-[13.5px] outline-none"
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCreatingList(true)}
            className="mt-1 flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13.5px] text-muted-foreground transition-colors hover:bg-surface-2"
          >
            <Plus className="size-4" aria-hidden />
            New list
          </button>
        )}
      </div>

      {/* task list */}
      <div className="flex min-w-0 flex-1 flex-col">
        <PageHeader title={title} subtitle={`${open.length} open · ${done.length} completed`} />
        <div className="mx-auto w-full max-w-2xl flex-1 px-3 py-4 md:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              const targetList = listId === "today" || listId === "upcoming" ? "inbox" : listId;
              const dueDate = listId === "today" ? TODAY : listId === "upcoming" ? dayOffset(1) : undefined;
              setSelectedId(addTask(draft.trim(), targetList, dueDate));
              setDraft("");
            }}
            className="mb-2 flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 focus-within:border-border-strong"
          >
            <Plus className="size-[18px] text-muted-foreground" aria-hidden />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a task"
              aria-label="Add a task"
              className="w-full bg-transparent text-[14.5px] outline-none placeholder:text-muted-foreground"
            />
          </form>

          {open.length === 0 && done.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="size-5" aria-hidden />}
              title="Nothing here yet"
              description="Add your first task above, or ask the assistant to plan something for you."
            />
          ) : (
            <>
              <div className="space-y-0.5">
                {open.map((t) => (
                  <TaskRow key={t.id} task={t} selected={t.id === selectedId} onSelect={() => setSelectedId(t.id)} />
                ))}
              </div>
              {done.length ? (
                <div className="mt-6 opacity-60">
                  <SectionLabel>Completed · {done.length}</SectionLabel>
                  <div className="space-y-0.5">
                    {done.map((t) => (
                      <TaskRow key={t.id} task={t} selected={t.id === selectedId} onSelect={() => setSelectedId(t.id)} />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* detail panel — desktop */}
      {selected ? (
        <div className="hidden w-[350px] shrink-0 border-l border-border xl:block">
          <div className="sticky top-0 h-screen">
            <TaskDetail task={selected} onClose={() => setSelectedId(null)} />
          </div>
        </div>
      ) : null}

      {/* detail sheet — mobile & iPad */}
      {selected ? (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button
            type="button"
            aria-label="Close task details"
            onClick={() => setSelectedId(null)}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-[1px]"
          />
          <div className="absolute inset-x-0 bottom-0 top-16 animate-in slide-in-from-bottom-6 overflow-hidden rounded-t-2xl border-t border-border bg-surface shadow-raised duration-200">
            <TaskDetail task={selected} onClose={() => setSelectedId(null)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RailLink({
  to,
  id,
  active,
  count,
  children,
}: {
  to: "/tasks/$listId";
  id: string;
  active: boolean;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      params={{ listId: id }}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13.5px] transition-colors",
        active ? "bg-surface-2 font-medium" : "text-foreground/80 hover:bg-surface-2/70",
      )}
    >
      {children}
      {count > 0 ? <span className="tnum ml-auto text-[12px] text-muted-foreground">{count}</span> : null}
    </Link>
  );
}

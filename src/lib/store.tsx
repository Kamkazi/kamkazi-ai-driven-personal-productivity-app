import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  TODAY,
  events as seedEvents,
  notebooks,
  seedConversations,
  seedNotes,
  seedTasks,
  taskLists as seedLists,
  type Conversation,
  type Note,
  type Task,
  type TaskList,
} from "@/data/seed";

type Theme = "light" | "dark";

interface Settings {
  defaultListId: string;
  defaultNotebookId: string;
  startPage: string;
  units: "C" | "F";
  weatherLocation: string;
  dailyBriefing: boolean;
  taskReminders: boolean;
  eventAlerts: boolean;
  markdownShortcuts: boolean;
  aiPersonalisation: boolean;
}

interface Store {
  tasks: Task[];
  lists: TaskList[];
  notes: Note[];
  conversations: Conversation[];
  events: typeof seedEvents;
  notebooks: typeof notebooks;
  theme: Theme;
  settings: Settings;
  paletteOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setPaletteOpen: (v: boolean) => void;
  toggleTheme: () => void;

  updateSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  addTask: (title: string, listId?: string, dueDate?: string) => string;
  deleteTask: (id: string) => void;
  addList: (name: string) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  addNote: (notebookId?: string) => string;
  deleteNote: (id: string) => void;
  addConversation: () => string;
  sendMessage: (conversationId: string, text: string) => void;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  togglePinConversation: (id: string) => void;
}

const StoreContext = createContext<Store | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [lists, setLists] = useState<TaskList[]>(seedLists);
  const [notes, setNotes] = useState<Note[]>(seedNotes);
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [theme, setTheme] = useState<Theme>("light");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    defaultListId: "inbox",
    defaultNotebookId: "personal",
    startPage: "Today",
    units: "C",
    weatherLocation: "Kolkata",
    dailyBriefing: true,
    taskReminders: true,
    eventAlerts: true,
    markdownShortcuts: true,
    aiPersonalisation: true,
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: TODAY } : t)));
  }, []);

  const addTask = useCallback((title: string, listId = "inbox", dueDate?: string) => {
    const id = uid();
    setTasks((prev) => [
      {
        id,
        title,
        listId,
        done: false,
        dueDate,
        priority: "none",
        tags: [],
        subtasks: [],
        attachments: [],
        createdAt: TODAY,
        updatedAt: TODAY,
      },
      ...prev,
    ]);
    return id;
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addList = useCallback((name: string) => {
    setLists((prev) => [
      ...prev,
      { id: uid(), name, icon: "list", color: "oklch(0.6 0.1 300)" },
    ]);
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Note>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: TODAY } : n)));
  }, []);

  const addNote = useCallback((notebookId = "personal") => {
    const id = uid();
    setNotes((prev) => [
      { id, title: "", body: "", notebookId, tags: [], pinned: false, updatedAt: TODAY },
      ...prev,
    ]);
    return id;
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addConversation = useCallback(() => {
    const id = uid();
    setConversations((prev) => [{ id, title: "New chat", updatedAt: TODAY, messages: [] }, ...prev]);
    return id;
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        const reply = draftReply(text);
        return {
          ...c,
          title: c.messages.length === 0 ? text.slice(0, 42) : c.title,
          updatedAt: TODAY,
          messages: [
            ...c.messages,
            { id: uid(), role: "user" as const, content: text },
            { id: uid(), role: "assistant" as const, ...reply },
          ],
        };
      }),
    );
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const togglePinConversation = useCallback((id: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
  }, []);

  const value = useMemo<Store>(
    () => ({
      tasks,
      lists,
      notes,
      conversations,
      events: seedEvents,
      notebooks,
      theme,
      settings,
      paletteOpen,
      setPaletteOpen,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      updateSetting: (k, v) => setSettings((s) => ({ ...s, [k]: v })),
      toggleTask,
      updateTask,
      addTask,
      deleteTask,
      addList,
      updateNote,
      addNote,
      deleteNote,
      addConversation,
      sendMessage,
      renameConversation,
      deleteConversation,
      togglePinConversation,
    }),
    [
      tasks,
      lists,
      notes,
      conversations,
      theme,
      settings,
      paletteOpen,
      toggleTask,
      updateTask,
      addTask,
      deleteTask,
      addList,
      updateNote,
      addNote,
      deleteNote,
      addConversation,
      sendMessage,
      renameConversation,
      deleteConversation,
      togglePinConversation,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/** Scripted assistant responses for the prototype. */
function draftReply(text: string): { content: string; action?: Conversation["messages"][number]["action"] } {
  const t = text.toLowerCase();
  if (t.startsWith("/task") || t.includes("create a task") || t.includes("add a task")) {
    const title = text.replace(/^\/task\s*/i, "").replace(/create a task to\s*/i, "") || "New task";
    return {
      content: "Added it to your Inbox.",
      action: { kind: "task", title: title.slice(0, 60), meta: "Today · Inbox" },
    };
  }
  if (t.includes("note")) {
    return {
      content: "I found **2 notes** that look relevant: *Acme homepage — review notes* and *Q4 roadmap thinking*. Want me to pull the open items out of either one?",
    };
  }
  if (t.includes("prioriti") || t.includes("today") || t.includes("schedule")) {
    return {
      content: `Here's how today looks:

1. **Finish homepage wireframes** — due 11:00, right before the design review
2. **Send proposal to client** — due 3:00 PM, the only external deadline
3. **Review Priya's onboarding copy** — no fixed time, good filler task

Your afternoon after 2:00 PM is open apart from weekly planning at 5:30.`,
    };
  }
  if (t.includes("free time")) {
    return { content: "You're clear from **2:00 PM to 5:30 PM** — the longest open stretch today." };
  }
  return {
    content: `Here's what I can see from your workspace:

- **6 tasks** due in the next three days
- **3 meetings** left today, ending at 6:00 PM
- Your most recently edited note is *Japan trip — spring plan*

Ask me to plan your day, prioritise tasks, search notes, or create something.`,
  };
}

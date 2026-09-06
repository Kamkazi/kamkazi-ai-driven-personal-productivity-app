import { createFileRoute } from "@tanstack/react-router";
import { NotesScreen } from "@/components/notes-screen";

export const Route = createFileRoute("/notes/")({
  head: () => ({
    meta: [
      { title: "Notes — Daylight" },
      { name: "description", content: "Notebooks, pinned notes and a distraction-free Markdown editor." },
      { property: "og:title", content: "Notes — Daylight" },
      { property: "og:description", content: "Notebooks, pinned notes and a distraction-free Markdown editor." },
    ],
  }),
  component: () => <NotesScreen />,
});

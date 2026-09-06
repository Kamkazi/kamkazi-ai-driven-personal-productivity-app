import { createFileRoute } from "@tanstack/react-router";
import { TodayScreen } from "@/components/today-screen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Kamkazi, your calm daily workspace" },
      {
        name: "description",
        content:
          "A daily briefing, one timeline for meetings and tasks, quick capture and an assistant that understands your day.",
      },
      { property: "og:title", content: "Today — Kamkazi, your calm daily workspace" },
      {
        property: "og:description",
        content:
          "A daily briefing, one timeline for meetings and tasks, quick capture and an assistant that understands your day.",
      },
    ],
  }),
  component: TodayScreen,
});

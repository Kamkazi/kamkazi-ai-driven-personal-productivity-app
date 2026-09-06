import { createFileRoute } from "@tanstack/react-router";
import { ChatScreen } from "@/components/chat-screen";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [
      { title: "AI Chat — Daylight" },
      { name: "description", content: "Ask about your day, prioritise tasks, search notes and create things by typing." },
      { property: "og:title", content: "AI Chat — Daylight" },
      { property: "og:description", content: "Ask about your day, prioritise tasks, search notes and create things by typing." },
    ],
  }),
  component: () => <ChatScreen />,
});

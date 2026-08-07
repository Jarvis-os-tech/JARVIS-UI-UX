import { createFileRoute } from "@tanstack/react-router";
import { JarvisApp } from "@/components/jarvis/JarvisApp";

const title = "JARVIS — Autonomous Voice Orchestrator HUD";
const description =
  "A holographic command deck for an always-on voice AI: live agent swarm, mission control, memory recall and autonomous workflows.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JarvisApp,
});

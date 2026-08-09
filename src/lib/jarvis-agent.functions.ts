import { createServerFn } from "@tanstack/react-start";
import { streamText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const Turn = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string(),
});

const Input = z.object({
  messages: z.array(Turn),
  context: z.string(),
});

const Reply = z.object({
  reply: z.string(),
  action: z.enum([
    "none",
    "create_mission",
    "pause_mission",
    "resume_mission",
    "cancel_mission",
    "start_agent",
    "stop_agent",
    "navigate",
    "clear_chat",
    "speak_off",
    "speak_on",
  ]),
  target: z.string(),
});

const SYSTEM = `You are JARVIS, an autonomous voice orchestrator for a single operator named Gopi.
Speak like a calm, precise British AI butler: warm, brief, confident. Never use markdown, lists,
emojis or code — your reply is spoken aloud, so keep it to one or two short sentences.

You control a live command deck. When the operator asks for something actionable, choose exactly one action:
- create_mission: target = a short mission title
- pause_mission / resume_mission / cancel_mission: target = the mission title mentioned
- start_agent / stop_agent: target = the agent name mentioned
- navigate: target = one of dashboard, memory, agents, connectors, mission, workflows, settings
- clear_chat, speak_off, speak_on: target = ""
- none: target = "" (for conversation, questions, status reports)

Use the live system snapshot to answer status questions with real numbers.`;

export const askJarvis = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
      system: `${SYSTEM}

LIVE SYSTEM SNAPSHOT:
${data.context}

Respond with raw JSON only (no code fences) shaped exactly like:
{"reply":"...","action":"none","target":""}`,
      messages: data.messages.map((m) => ({
        role: m.role,
        content: m.text,
      })),
    });

    const raw = (await result.text).trim();
    const json = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    try {
      const parsed = Reply.parse(JSON.parse(json.slice(json.indexOf("{"), json.lastIndexOf("}") + 1)));
      return parsed;
    } catch {
      return { reply: raw || "Understood.", action: "none" as const, target: "" };
    }
  });


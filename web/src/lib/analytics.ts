// The only file that talks to TraceIQ.
//
// The app promises "your chat never leaves your phone", so events only say
// what someone *did*, never anything *from* the chat: no names, counts,
// emojis or text. The types below enforce that every event has a fixed shape.
import { traceiq } from "traceiq-sdk-js";

interface Events {
  chat_analyzed: { source: "txt" | "zip" | "demo" };
  upload_failed: {
    source: "txt" | "zip";
    reason: "no_messages" | "read_error";
  };
  slide_viewed: { slide: string; position: number; total: number };
  story_completed: Record<string, never>;
  image_downloaded: { format: "status" | "x" };
  image_failed: { format: "status" | "x" };
}

let enabled = false;

export function initAnalytics() {
  const projectId = import.meta.env.VITE_TRACEIQ_PROJECT_ID;
  const writeKey = import.meta.env.VITE_TRACEIQ_WRITE_KEY;
  // No keys (e.g. running locally) = analytics stays off
  if (!projectId || !writeKey) return;
  // Respect the browser's "don't track me" settings
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;

  traceiq.initialize({
    projectId,
    writeKey,
    endpoint: "https://api.traceiq.run",
    environment: import.meta.env.MODE,
    // Never record the screen: the slides show people's names
    enableReplay: false,
    replay: { enabled: false },
    autoCaptureRequests: false,
  });
  enabled = true;
}

export function track<K extends keyof Events>(name: K, properties: Events[K]) {
  if (enabled) traceiq.track(name, properties);
}

// WebSocket server setup
import http from "http";
import { createSocketServer } from "../config/socket";
import { registerCharacterHandlers } from "./characterHandlers";
import { registerEmotionHandlers } from "./emotionHandlers";
import { registerVrmHandlers } from "./vrmHandlers";

/* ------------------------------------------------------------------ */
/*  This file is imported by src/index.ts _after_ the Express app     */
/*  and HTTP server have been created.                                */
/* ------------------------------------------------------------------ */

/**
 * Bootstraps Socket.IO, attaches all real-time namespaces and returns the
 * fully-initialised instance so other modules (e.g. streamingManager) can
 * emit events globally.
 */
export function initWebsocketLayer(httpServer: http.Server) {
  const io = createSocketServer(httpServer);

  // Character chat & learning namespace
  const characterNS = io.of("/character");
  registerCharacterHandlers(characterNS);

  // Emotion-tracking namespace
  const emotionNS = io.of("/emotion");
  registerEmotionHandlers(emotionNS);

  // VRM animation namespace
  const vrmNS = io.of("/vrm");
  registerVrmHandlers(vrmNS);

  console.info("[socket] WebSocket layer initialised");
  return io;
}
// VRM animation event handlers
import { Namespace, Socket } from "socket.io";
import { VrmAnimationService } from "../services/vrmAnimation.service";   // 🆕
import { EmotionMapper } from "../utils/emotionMapper";                  // 🆕

const vrm = new VrmAnimationService();
const mapper = new EmotionMapper();

/* ------------------------------------------------------------------ */
/*  /vrm namespace – receives high-level events and emits low-level    */
/*  animation commands understood by the Three.js / WebGL client.      */
/* ------------------------------------------------------------------ */
export function registerVrmHandlers(ns: Namespace) {
  ns.on("connection", (socket: Socket) => {
    /* ---------- 1. CHARACTER EMOTION → EXPRESSION ------------------ */
    socket.on("character_emotion_change", async (payload: { emotion: string }) => {
      const { emotion } = payload;
      const blendshape = mapper.toBlendshape(emotion);        // e.g. "Smile"
      const animCmd = vrm.buildExpressionCommand(blendshape); // { type:"facial", ... }

      socket.emit("vrm_animation", animCmd);
    });

    /* ---------- 2. VOICE TIMING (visemes) -------------------------- */
    socket.on("lip_sync_data", async (payload: { viseme: string }) => {
      const animCmd = vrm.buildVisemeCommand(payload.viseme); // { type:"lipSync", ... }
      socket.emit("vrm_animation", animCmd);
    });

    /* ---------- 3. EXTERNAL CONTROL (manual gestures) -------------- */
    socket.on("gesture_request", async (payload: { gesture: string }) => {
      const animCmd = vrm.buildGestureCommand(payload.gesture);
      socket.emit("vrm_animation", animCmd);
    });
  });
}

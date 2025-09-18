// Emotion event handlers
import { Namespace, Socket } from "socket.io";
import { EmotionAnalysisService } from "../services/emotionAnalysis.service";

const emotionAI = new EmotionAnalysisService();

export function registerEmotionHandlers(ns: Namespace) {
  ns.on("connection", (socket: Socket) => {
    socket.on("user_emotion", async (payload: { text: string }) => {
      try {
        const emotions = await emotionAI.analyzeEmotion(payload.text);
        const primaryEmotion = emotions[0];
        socket.emit("character_emotion_change", { 
          emotion: primaryEmotion.emotion,
          intensity: primaryEmotion.intensity
        });
      } catch {
        /* silently ignore errors – non-critical */
      }
    });
  });
}

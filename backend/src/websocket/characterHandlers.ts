// Chat event handlers
import { Namespace, Socket } from "socket.io";
import { CharacterAIService } from "../services/characterAI.service";
import { ConversationManager } from "./conversationManager";
import { StreamingManager } from "./streamingManager";
import { ErrorRecoveryService } from "../services/errorRecovery.service";
import { RealTimeMonitor } from "../services/realTimeMonitor.service";

const characterAI = new CharacterAIService();
const conversationManager = new ConversationManager();
const streamingManager = new StreamingManager();
const errorRecovery = new ErrorRecoveryService();
const realTimeMonitor = new RealTimeMonitor();

/* ------------------------------------------------------------------ */
/*  Register all event listeners for the /character namespace         */
/* ------------------------------------------------------------------ */
export function registerCharacterHandlers(ns: Namespace) {
  ns.on("connection", (socket: Socket) => {
    const userId = socket.data.user?.userId as string;

    /* ---------- 1. USER TEXT MESSAGE -------------------------------- */
    socket.on("user_message", async (payload: { text: string }) => {
      try {
        // Start performance monitoring
        realTimeMonitor.startTimer(userId);

        // Validate user input first
        const validation = errorRecovery.validateUserInput(payload.text);
        if (!validation.isValid) {
          const session = await conversationManager.getCurrentSession(userId);
          const characterId = (session?.characterId || 'maria') as 'maria' | 'akira';
          const errorMessage = errorRecovery.getCharacterErrorMessage(characterId, validation.errorType as any);
          socket.emit("character_response", { text: errorMessage, isError: true });
          
          realTimeMonitor.trackError(userId, 'input_validation');
          realTimeMonitor.endTimer(userId, socket);
          return;
        }

        // Check connection health
        if (!realTimeMonitor.checkConnectionHealth(socket)) {
          realTimeMonitor.trackError(userId, 'connection_issue');
          throw new Error('Connection health check failed');
        }

        // Track message in DB / memory
        const convoCtx = await conversationManager.appendUserMessage(
          userId,
          payload.text
        );

        // Get current session to determine character
        const session = await conversationManager.getCurrentSession(userId);
        const characterId = session?.characterId || 'maria';

        // Emit typing indicator immediately
        socket.emit("character_thinking");

        const streamStartTime = Date.now();

        // Get enhanced streaming iterator from CharacterAI
        const stream = await characterAI.streamResponse({
          characterId: characterId as 'maria' | 'akira',
          userId: userId,
          sessionId: session?._id?.toString() || '',
          conversationHistory: convoCtx as { role: "user" | "assistant"; content: string }[]
        });

        // Monitor streaming health during response
        const healthCheckInterval = setInterval(() => {
          realTimeMonitor.monitorStreamingHealth(socket, streamStartTime);
        }, 10000); // Check every 10 seconds

        // Pipe enhanced stream through StreamingManager
        await streamingManager.pipeEnhancedToSocket(stream, socket, "character_stream");

        // Clear health monitoring
        clearInterval(healthCheckInterval);

        // Finalise conversation, get full response text
        const fullText = await stream.fullText();

        // Persist character response
        await conversationManager.appendCharacterMessage(userId, fullText);

        // Emit final response so frontend knows stream is complete
        socket.emit("character_response", { text: fullText });

        // End performance monitoring and log success
        const responseTime = realTimeMonitor.endTimer(userId, socket);
        console.log(`[SUCCESS] Response delivered to ${userId} in ${responseTime}ms`);
      } catch (err) {
        console.error("[socket] user_message error", err);
        
        // Track error for monitoring
        realTimeMonitor.trackError(userId, 'general_error');
        
        // Get character-specific error message
        const session = await conversationManager.getCurrentSession(userId).catch(() => null);
        const characterId = (session?.characterId || 'maria') as 'maria' | 'akira';
        const errorType = errorRecovery.categorizeError(err);
        const errorMessage = errorRecovery.getCharacterErrorMessage(characterId, errorType);
        
        // Try to provide fallback response
        try {
          const fallbackResponse = errorRecovery.createFallbackResponse(characterId, payload.text);
          socket.emit("character_response", { 
            ...fallbackResponse, 
            isError: true,
            fallback: true 
          });
          socket.emit("vrm_animation", fallbackResponse.animation);
        } catch (fallbackError) {
          // Ultimate fallback
          socket.emit("error", { message: errorMessage });
        }

        // End timer even on error
        realTimeMonitor.endTimer(userId, socket);
      }
    });

    /* ---------- 2. LANGUAGE SWITCH ---------------------------------- */
    socket.on("switch_language", async (payload: { language: string }) => {
      try {
        const mode = await conversationManager.switchLanguage(
          userId,
          payload.language
        );
        socket.emit("language_switched", { mode });
      } catch (err) {
        socket.emit("error", { message: "Could not switch language." });
      }
    });

    /* ---------- 3. SESSION DISCONNECT ------------------------------- */
    socket.on("disconnect", () => {
      conversationManager.endSession(userId).catch(console.error);
    });
  });
}

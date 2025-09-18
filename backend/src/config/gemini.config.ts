// Gemini streaming & fallback config
export const geminiConfig = {
  streaming: {
    enabled: true,
    chunkSize: "sentence",   // sentence-level chunks
    bufferTime: 50           // 50 ms between emissions
  },
  contextManagement: {
    maxTokens: 8_000,
    personalityPrompt: 1_500,
    conversationHistory: 4_000,
    learningContext: 2_500
  },
  fallbackStrategy: {
    primaryAPI: "gemini-2.5-flash",
    fallbackAPI: "gemini-pro",
    maxRetries: 3,
    backoffStrategy: "exponential"
  }
};

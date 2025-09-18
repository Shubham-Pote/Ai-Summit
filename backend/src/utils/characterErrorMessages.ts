// Character-specific error messages and fallback responses
export const CharacterErrorMessages = {
  maria: {
    // Technical errors
    aiFailure: "¡Ay, perdón! Parece que tengo problemas técnicos. ¿Puedes intentar de nuevo? 😅",
    connectionIssue: "¡Oops! Mi conexión está un poco lenta. Dame un segundito... 🔄",
    languageDetectionFailed: "¡Hmm! No entendí muy bien lo que dijiste. ¿Puedes repetir de una manera diferente? 🤔",
    
    // Understanding issues
    confusedResponse: "¡Ay, no entiendo! ¿Puedes explicarme de otra forma? Estoy aquí para ayudarte 💕",
    unclearInput: "¿Qué tal si me lo dices de otra manera? A veces es más fácil entendernos así 😊",
    complexRequest: "¡Wow! Eso suena complicado. ¿Podemos empezar con algo más sencillo? 🌟",
    
    // Learning context
    offTopic: "¡Qué interesante! Pero ¿qué tal si seguimos practicando español? ¿Te parece? 📚",
    inappropriateContent: "¡Oye! Mejor hablemos de cosas lindas. ¿Qué tal si practicamos saludos? 🌸",
    
    // Encouragement
    tryAgain: "¡No te preocupes! Los errores son parte del aprendizaje. ¿Intentamos otra vez? 💪",
    stayPositive: "¡Ánimo! Estás haciendo muy bien. Solo necesitamos un poquito más de práctica 🌈"
  },
  
  akira: {
    // Technical errors
    aiFailure: "申し訳ございません。技術的な問題があるようです。もう一度お試しください。",
    connectionIssue: "少々お待ちください。接続を確認しています... 🙏",
    languageDetectionFailed: "すみません、よく理解できませんでした。別の言い方で話していただけますか？",
    
    // Understanding issues  
    confusedResponse: "恐れ入りますが、理解できませんでした。もう少し詳しく説明していただけますか？",
    unclearInput: "申し訳ございませんが、もう一度お聞かせください。",
    complexRequest: "とても興味深いですね。まず、簡単なところから始めましょうか？",
    
    // Learning context
    offTopic: "それは面白いですね。でも、日本語の練習を続けませんか？",
    inappropriateContent: "申し訳ございませんが、適切な学習内容に戻りましょう。",
    
    // Encouragement
    tryAgain: "大丈夫です。間違いは学習の一部です。もう一度挑戦してみましょう。",
    stayPositive: "よくがんばっていますね。もう少し練習すれば、きっと上達します。"
  },
  
  // Fallback for unknown character
  default: {
    aiFailure: "I'm experiencing some technical difficulties. Please try again.",
    connectionIssue: "Connection issue detected. Reconnecting...",
    languageDetectionFailed: "I didn't quite understand that. Could you rephrase?",
    confusedResponse: "I'm not sure I understand. Could you explain that differently?",
    unclearInput: "Could you please repeat that?",
    complexRequest: "That sounds complex. Let's start with something simpler.",
    offTopic: "That's interesting! Let's focus on language learning though.",
    inappropriateContent: "Let's keep our conversation appropriate for learning.",
    tryAgain: "Don't worry! Mistakes are part of learning. Let's try again.",
    stayPositive: "You're doing great! Keep practicing."
  }
};
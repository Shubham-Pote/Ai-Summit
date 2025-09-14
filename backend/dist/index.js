"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts - Just update the imports
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("./config/database"));
// Your existing routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const lesson_routes_1 = __importDefault(require("./routes/lesson.routes"));
const notes_routes_1 = __importDefault(require("./routes/notes.routes"));
const readingArticle_routes_1 = __importDefault(require("./routes/readingArticle.routes"));
// Character AI routes (make sure these files exist)
const characterSelection_routes_1 = __importDefault(require("./routes/characterSelection.routes"));
const character_routes_1 = __importDefault(require("./routes/character.routes"));
const conversation_routes_1 = __importDefault(require("./routes/conversation.routes"));
const audio_routes_1 = __importDefault(require("./routes/audio.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
(0, database_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
// Serve static audio files
app.use('/audio', express_1.default.static(path_1.default.join(__dirname, '../public/audio')));
app.use('/character-audio', express_1.default.static(path_1.default.join(__dirname, '../uploads/audio')));
// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Language Learning API with Character AI Support',
        features: [
            'Traditional Lessons',
            'Notes & Reading',
            'Character AI Conversations',
            'Voice Chat Support'
        ]
    });
});
// Your existing routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/lessons', lesson_routes_1.default);
app.use('/api/notes', notes_routes_1.default);
app.use('/api/reading', readingArticle_routes_1.default);
// Character AI routes
app.use('/api/character-setup', characterSelection_routes_1.default);
app.use('/api/characters', character_routes_1.default);
app.use('/api/conversations', conversation_routes_1.default);
app.use('/api/audio', audio_routes_1.default);
// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something broke!'
    });
});
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📚 Traditional learning: /api/lessons, /api/notes, /api/reading`);
    console.log(`🎭 Character AI: /api/characters, /api/conversations`);
    console.log(`🎵 Audio files: /audio/ (lessons) & /character-audio/ (AI voices)`);
    console.log(`🌐 Welcome endpoint: http://localhost:${port}/`);
});
//# sourceMappingURL=index.js.map
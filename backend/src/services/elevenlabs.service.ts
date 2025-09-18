import axios from "axios";
import fs from "fs";
import path from "path";

interface TTSOptions {
  voiceId: string;          // ElevenLabs voice
  text: string;
  emotion?: "happy" | "sad" | "excited" | "neutral";
}

/**
 * Generates speech audio via ElevenLabs and returns the local file path plus
 * an approximate viseme timeline (every 200 ms = one viseme placeholder).
 */
export class ElevenLabsService {
  private base = "https://api.elevenlabs.io/v1/text-to-speech";

  async synthesize({ voiceId, text, emotion = "neutral" }: TTSOptions) {
    const url = `${this.base}/${voiceId}`;
    const apiKey = process.env.ELEVENLABS_API_KEY!;
    const tmpDir = path.join(__dirname, "../../public/audio");
    fs.mkdirSync(tmpDir, { recursive: true });

    const resp = await axios.post(
      url,
      { text, model_id: "eleven_multilingual_v2", voice_settings: { style: emotion } },
      { headers: { "xi-api-key": apiKey }, responseType: "arraybuffer" }
    );

    const fileName = `speech_${Date.now()}.mp3`;
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, resp.data);

    // naive viseme timeline: one viseme token per 200 ms
    const durationSec = resp.headers["content-length"] / 16_000; // rough MP3 size→sec
    const visemes = Math.ceil(durationSec / 0.2);
    const timeline = Array.from({ length: visemes }, (_, i) => ({
      t: i * 200,
      v: ["A", "E", "I", "O", "U"][i % 5]
    }));

    return { url: `/audio/${fileName}`, timeline };
  }
}

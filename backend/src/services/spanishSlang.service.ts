// Spanish casual/slang detection
const SLANG_MAP: Record<string, string> = {
  "que padre": "¡Qué padre!",
  "no manches": "¡No manches!",
  "orale": "¡Órale!",
  "chevere": "¡Chévere!"
};

export class SpanishSlangService {
  /** Replace known slang with normalised, accented forms */
  normalise(text: string) {
    const lower = text.toLowerCase();
    for (const [raw, proper] of Object.entries(SLANG_MAP)) {
      if (lower.includes(raw)) {
        return { changed: true, text: text.replace(new RegExp(raw, "i"), proper) };
      }
    }
    return { changed: false, text };
  }
}

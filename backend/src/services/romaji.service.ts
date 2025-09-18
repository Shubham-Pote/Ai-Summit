// Japanese romaji conversion
import wanakana from "wanakana";

export class RomajiService {
  /**
   * If the entire string is recognised romaji, returns its Hiragana.
   * Otherwise returns empty string.
   */
  convertIfRomaji(text: string): string | "" {
    if (wanakana.isRomaji(text.replace(/\s+/g, ""))) {
      return wanakana.toHiragana(text);
    }
    return "";
  }
}

// Cultural learning integration
export class CulturalContextService {
  generateNote(original: string, lang: "es" | "ja") {
    if (lang === "es") {
      return "Tip: In Mexican Spanish, tone is expressive—add '¡' and '!' for enthusiasm.";
    }
    return "Tip: In Japanese, end sentences politely with です/ます to show respect.";
  }
}

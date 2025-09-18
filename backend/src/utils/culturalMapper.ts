export class CulturalMapper {
  regionToFlag(region: string) {
    return region === "Mexico" ? "🇲🇽" : "🇯🇵";
  }
}

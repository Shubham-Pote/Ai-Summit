// Emotion to animation mapping
export class EmotionMapper {
  private map: Record<string, string> = {
    happy: "Smile",
    sad: "Frown",
    excited: "EyeWide",
    confused: "BrowDown",
    neutral: "Idle"
  };

  toBlendshape(emotion: string) {
    return this.map[emotion] ?? "Idle";
  }
}

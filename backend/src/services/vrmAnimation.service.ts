// VRM blendshape control
export class VrmAnimationService {
  buildExpressionCommand(blendshape: string) {
    return {
      type: "facial",
      blendshape,
      duration: 1_000,
      easing: "easeInOut"
    };
  }

  buildVisemeCommand(viseme: string) {
    return {
      type: "lipSync",
      viseme,
      weight: 1.0
    };
  }

  buildGestureCommand(gesture: string) {
    return {
      type: "body",
      gesture,
      duration: 1_500
    };
  }
}

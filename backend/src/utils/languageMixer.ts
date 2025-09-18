export class LanguageMixer {
  /** Simple heuristic to merge Spanish & Japanese snippets into output */
  mix(spanish: string, japanese: string) {
    return `${spanish}  ／  ${japanese}`;
  }
}

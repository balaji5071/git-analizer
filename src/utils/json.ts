export function extractJsonObject(input: string) {
  const trimmed = input.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      throw new Error("No JSON object found in model response.");
    }

    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }
}

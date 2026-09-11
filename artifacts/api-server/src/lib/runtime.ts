export async function isOllamaAvailable() {
  const baseUrl = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/tags`, {
      signal: AbortSignal.timeout(700),
    });
    return response.ok;
  } catch {
    return false;
  }
}
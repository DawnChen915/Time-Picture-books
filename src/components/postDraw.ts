/**
 * Ask the server to draw an image. Resolves to null when the server took the job (or another tab
 * already has it: 409), otherwise to a message explaining why the request didn't get through.
 */
export async function postDraw(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { method: "POST" });
    if (res.ok || res.status === 409) return null;
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    return json.error ?? `服务器出错（${res.status}）`;
  } catch {
    return "连不上服务器，请检查网络，或确认 npm run dev 还在运行";
  }
}

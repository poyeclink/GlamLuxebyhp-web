const TRANSLATION_MODEL = "@cf/meta/m2m100-1.2b";

type WorkersAiResponse = {
  success: boolean;
  result?: { translated_text?: string };
  errors?: { message: string }[];
};

export async function translateWithWorkersAi(
  text: string,
  targetLang: "en",
  sourceLang: "es" = "es",
): Promise<string> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    throw new Error("CLOUDFLARE_API_TOKEN o R2_ACCOUNT_ID no están configurados.");
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${TRANSLATION_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, source_lang: sourceLang, target_lang: targetLang }),
    },
  );

  const data = (await response.json()) as WorkersAiResponse;
  if (!response.ok || !data.success || typeof data.result?.translated_text !== "string") {
    const message = data.errors?.[0]?.message ?? `HTTP ${response.status}`;
    throw new Error(`Cloudflare Workers AI translation failed: ${message}`);
  }

  return data.result.translated_text;
}

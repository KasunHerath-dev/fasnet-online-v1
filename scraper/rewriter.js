import { GoogleGenAI, ThinkingLevel } from '@google/genai';

/**
 * Universal AI rewriter using the unified Gemini 2.0 model
 */
export async function rewriteNotice({ title, body, config = {} }) {
    const apiKey = config.apiKey;
    const SITE_VOICE = process.env.SITE_VOICE || 'professional';

    if (!apiKey) {
        console.warn(`[rewriter] No API key provided for Gemini. Using original content.`);
        return fallback(title, body);
    }

    const systemInstruction = `
      You are a specialized content editor for a university student portal using a ${SITE_VOICE} voice.
      Your task is to transform raw scraped faculty notices into original, clear, student-friendly content.
      
      RULES:
      1. TONE: Always use a ${SITE_VOICE} academic tone.
      2. REWRITE: Do NOT copy sentences verbatim.
      3. SPARSE DATA: If the body is short/list-based, use the Title to expand into a complete announcement.
      4. TRUTH: Maintain 100% factual accuracy.
      5. JSON: Return ONLY valid JSON matching this schema:
         {
           "title": "A catchy rewritten title",
           "body": "The full detailed content of the notice",
           "summary": "A short 1-2 sentence overview",
           "tags": ["Tag1", "Tag2"]
         }
    `;

    const rewritePrompt = `
      REWRITE THIS NOTICE DATA INTO THE JSON SCHEMA SPECIFIED:
      - Title: "${title}"
      - Body: "${body || 'No content provided'}"
      
      Output only the JSON.
    `;

    try {
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: rewritePrompt,
            config: {
                systemInstruction,
                thinkingConfig: {
                    thinkingLevel: ThinkingLevel.LOW
                },
                temperature: 1.0 // Recommended for Gemini 3 reasoning
            }
        });

        const rawResponse = response.text;
        const cleaned = rawResponse.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        return JSON.parse(cleaned);

    } catch (err) {
        console.error(`[rewriter] Gemini 3 rewrite failed:`, err.message);
        return fallback(title, body);
    }
}

function fallback(title, body) {
    return {
        title,
        body,
        summary: body?.substring(0, 160) + '...',
        tags: []
    };
}

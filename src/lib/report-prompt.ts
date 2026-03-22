/** Default instruction when the client omits `prompt` in POST /api/report. */
export const DEFAULT_WEEKLY_REPORT_PROMPT = `Analyze user's anger diary entries for the selected period.

Return:

1. 3 key patterns
2. most frequent triggers
3. short practical suggestions

Avoid therapy language. Be concise.`

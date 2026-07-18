import { gemini } from './gemini'

export type ReplyIntent = 'completed' | 'issue' | 'delay' | 'in_progress' | 'unknown'

export interface ClassificationResult {
  intent: ReplyIntent
  confidence: number
  summary: string
}

export async function classifyReply(employeeReply: string): Promise<ClassificationResult> {
  const prompt = `
You are an AI assistant for a WhatsApp Task Management System.

Your job is to classify employee replies.

Possible intents:

completed
issue
delay
in_progress
unknown

Rules:

1. Return ONLY valid JSON.
2. Do not include markdown.
3. Confidence must be between 0 and 1.
4. Summary must be under 20 words.

Examples:

Reply:
Done sir

{
  "intent":"completed",
  "confidence":0.99,
  "summary":"Employee confirmed completion."
}

Reply:
Need another hour

{
  "intent":"delay",
  "confidence":0.95,
  "summary":"Employee requested more time."
}

Reply:
Customer wasn't available.

{
  "intent":"issue",
  "confidence":0.98,
  "summary":"Customer unavailable."
}

Reply:
Working on it.

{
  "intent":"in_progress",
  "confidence":0.96,
  "summary":"Employee is working on task."
}

Now classify:

${employeeReply}
`

  const response = await gemini.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  })

  const text = response.text?.trim() ?? ''

  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    return {
      intent: 'unknown',
      confidence: 0,
      summary: employeeReply,
    }
  }
}

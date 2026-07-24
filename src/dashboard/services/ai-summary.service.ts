import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

interface SummaryInput {
  assigned: number
  completed: number
  inProgress: number
  issues: number
}

export async function generateDailySummary(data: SummaryInput) {
  const prompt = `
You are an operations manager for a construction company.

Generate a professional daily summary.

Statistics:

Assigned Tasks: ${data.assigned}
Completed Tasks: ${data.completed}
In Progress: ${data.inProgress}
Issues: ${data.issues}

Return ONLY a concise paragraph (maximum 120 words).

Mention:
- today's performance
- risks
- recommendation for tomorrow
`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    return response.text ?? 'No AI summary could be generated.'
  } catch {
    return 'Unable to generate AI summary.'
  }
}

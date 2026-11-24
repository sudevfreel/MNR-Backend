// import { GoogleGenAI } from '@google/genai'
// import dotenv from 'dotenv'

// dotenv.config()

// export const gemini = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY!,
// })

import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'

dotenv.config()

let geminiClient: GoogleGenAI | null = null

export function getGemini() {
  if (geminiClient) {
    return geminiClient
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables')
  }

  geminiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: 15000,
      retryOptions: {
        attempts: 1,
      },
    },
  })

  return geminiClient
}

// import { gemini } from './gemini'

// export type ReplyIntent = 'completed' | 'issue' | 'delay' | 'in_progress' | 'unknown'

// export interface ClassificationResult {
//   intent: ReplyIntent
//   confidence: number
//   summary: string
// }

// export async function classifyReply(employeeReply: string): Promise<ClassificationResult> {
//   try {
//     console.log('1. Building prompt')

//     const prompt = `
// You are an AI assistant for a WhatsApp Task Management System.

// Your job is to classify employee replies.

// Possible intents:

// completed
// issue
// delay
// in_progress
// unknown

// Rules:

// 1. Return ONLY valid JSON.
// 2. Do not include markdown.
// 3. Confidence must be between 0 and 1.
// 4. Summary must be under 20 words.

// Examples:

// Reply:
// Done sir

// {
//   "intent":"completed",
//   "confidence":0.99,
//   "summary":"Employee confirmed completion."
// }

// Reply:
// Need another hour

// {
//   "intent":"delay",
//   "confidence":0.95,
//   "summary":"Employee requested more time."
// }

// Reply:
// Customer wasn't available.

// {
//   "intent":"issue",
//   "confidence":0.98,
//   "summary":"Customer unavailable."
// }

// Reply:
// Working on it.

// {
//   "intent":"in_progress",
//   "confidence":0.96,
//   "summary":"Employee is working on task."
// }

// Now classify:

// ${employeeReply}
// `

//     console.log('2. Calling Gemini')

//     const response = await gemini.models.generateContent({
//       model: 'gemini-3.5-flash', //Done
//       contents: prompt,
//     })

//     console.log('3. Gemini responded')

//     console.log(response)

//     const text = response.text?.trim() ?? ''

//     console.log('4. Raw text')
//     console.log(text)

//     const cleaned = text
//       .replace(/```json/g, '')
//       .replace(/```/g, '')
//       .trim()

//     console.log('5. Cleaned')
//     console.log(cleaned)

//     return JSON.parse(cleaned)
//   } catch (error: any) {
//     console.error('classifyReply ERROR:', error)
//     console.error('Gemini Error')
//     console.error('Status:', error?.status)
//     console.error('Code:', error?.code)
//     console.error('Message:', error?.message)
//     console.error('Full Error:', error)
//     throw error
//   }
// }

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

// import { GoogleGenAI } from '@google/genai'
// import dotenv from 'dotenv'

// dotenv.config()

// export const gemini = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY!,
// })

import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is missing from environment variables')
}

export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 15000,
    retryOptions: {
      attempts: 1,
    },
  },
})

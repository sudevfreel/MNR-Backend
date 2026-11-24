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

import { gemini } from './gemini'

export type ReplyIntent = 'completed' | 'issue' | 'delay' | 'in_progress' | 'unknown'

export interface ClassificationResult {
  intent: ReplyIntent
  confidence: number
  summary: string
}

const VALID_INTENTS: ReplyIntent[] = ['completed', 'issue', 'delay', 'in_progress', 'unknown']

export async function classifyReply(employeeReply: string): Promise<ClassificationResult> {
  try {
    console.log('\n========================================')
    console.log('🤖 GEMINI CLASSIFICATION STARTED')
    console.log('========================================')

    console.log('📩 Employee Reply:', employeeReply)

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

    console.log('📤 Sending request to Gemini...')
    console.log('📡 Model: gemini-3.5-flash')

    const startTime = Date.now()

    const response = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    })

    const duration = Date.now() - startTime

    console.log('✅ Gemini API responded successfully')
    console.log(`⏱️ Response Time: ${duration}ms`)

    const text = response.text?.trim() ?? ''

    console.log('\n📄 RAW GEMINI RESPONSE:')
    console.log(text)

    if (!text) {
      throw new Error('Gemini returned an empty response')
    }

    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    console.log('\n🧹 CLEANED GEMINI RESPONSE:')
    console.log(cleaned)

    const result = JSON.parse(cleaned) as ClassificationResult

    console.log('\n🔍 CLASSIFICATION RESULT:')
    console.log('Intent:', result.intent)
    console.log('Confidence:', result.confidence)
    console.log('Summary:', result.summary)

    // Validate intent
    if (!VALID_INTENTS.includes(result.intent)) {
      throw new Error(`Invalid Gemini intent: ${result.intent}`)
    }

    // Validate confidence
    if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
      throw new Error(`Invalid Gemini confidence: ${result.confidence}`)
    }

    // Validate summary
    if (typeof result.summary !== 'string') {
      throw new Error('Invalid Gemini summary')
    }

    console.log('\n========================================')
    console.log('✅ GEMINI CLASSIFICATION SUCCESS')
    console.log(`🎯 FINAL INTENT: ${result.intent}`)
    console.log(`📊 CONFIDENCE: ${result.confidence * 100}%`)
    console.log('========================================\n')

    return result
  } catch (error: any) {
    console.error('\n========================================')
    console.error('❌ GEMINI CLASSIFICATION FAILED')
    console.error('========================================')

    console.error('Employee Reply:', employeeReply)
    console.error('Error Name:', error?.name)
    console.error('Status:', error?.status)
    console.error('Code:', error?.code)
    console.error('Message:', error?.message)
    console.error('Full Error:', error)

    console.error('========================================\n')

    throw error
  }
}

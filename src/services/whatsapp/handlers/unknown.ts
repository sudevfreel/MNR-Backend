// src/services/whatsapp/handlers/unknown.ts

import type { Payload } from 'payload'
import { sendTextMessage } from '../send-text'

interface HandleUnknownParams {
  payload: Payload
  conversation: any
  phone: string
  summary: string
}

export async function handleUnknown({
  payload,
  conversation,
  phone,
  summary,
}: HandleUnknownParams) {
  // Update Conversation
  await payload.update({
    collection: 'conversations',
    id: conversation.id,
    data: {
      aiIntent: 'unknown',
      aiSummary: summary,
      isProcessedByAI: true,
    },
  })

  // Notify Employee
  await sendTextMessage({
    phone,
    text: `🤔 *I'm not sure I understood your reply.*

Please reply naturally or use one of these examples:

✅ Done
🚧 Still working
⏳ Need another hour
⚠️ Customer unavailable
❌ Material not available

Your reply will automatically update your task.`,
  })

  console.log('❓ Unknown employee reply')
}

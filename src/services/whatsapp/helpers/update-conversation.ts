// src/services/whatsapp/helpers/update-conversation.ts

import type { Payload } from 'payload'

interface UpdateConversationParams {
  payload: Payload
  conversationId: string
  intent: string
  summary: string
  processed?: boolean
}

export async function updateConversation({
  payload,
  conversationId,
  intent,
  summary,
  processed = true,
}: UpdateConversationParams) {
  return await payload.update({
    collection: 'conversations',
    id: conversationId,
    data: {
      aiIntent: intent as any,
      aiSummary: summary,
      isProcessedByAI: processed,
    },
  })
}

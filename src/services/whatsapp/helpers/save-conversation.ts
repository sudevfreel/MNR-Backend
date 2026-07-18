// src/services/whatsapp/helpers/save-conversation.ts

import type { Payload } from 'payload'

interface SaveConversationParams {
  payload: Payload
  taskId: string
  employeeId: string
  message: string
  whatsappMessageId: string
}

export async function saveConversation({
  payload,
  taskId,
  employeeId,
  message,
  whatsappMessageId,
}: SaveConversationParams) {
  const conversation = await payload.create({
    collection: 'conversations',
    data: {
      task: taskId,
      employee: employeeId,
      direction: 'incoming',
      messageType: 'text',
      message,
      whatsappMessageId,
      messageStatus: 'delivered',
      isProcessedByAI: false,
    },
  })

  console.log('💾 Incoming conversation saved')

  return conversation
}

// src/services/whatsapp/handlers/in-progress.ts

import type { Payload } from 'payload'
import { TaskStatus } from '@/core/enums/task-status'
import { sendTextMessage } from '../send-text'

interface HandleInProgressParams {
  payload: Payload
  task: any
  conversation: any
  phone: string
  summary: string
}

export async function handleInProgress({
  payload,
  task,
  conversation,
  phone,
  summary,
}: HandleInProgressParams) {
  // Update Task
  await payload.update({
    collection: 'tasks',
    id: task.id,
    data: {
      status: TaskStatus.IN_PROGRESS,
    },
  })

  // Update Conversation
  await payload.update({
    collection: 'conversations',
    id: conversation.id,
    data: {
      aiIntent: 'in_progress',
      aiSummary: summary,
      isProcessedByAI: true,
    },
  })

  // Notify Employee
  await sendTextMessage({
    phone,
    text: `👍 *Update Received*

Thanks for the update.

We've marked your task as *In Progress*.

💪 Keep going! Once you've finished, simply reply with *Done*.`,
  })

  console.log(`🚧 Task ${task.taskNumber} marked as IN_PROGRESS`)
}

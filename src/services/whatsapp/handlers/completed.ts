// src/services/whatsapp/handlers/completed.ts

import type { Payload } from 'payload'
import { TaskStatus } from '@/core/enums/task-status'
import { sendTextMessage } from '../send-text'
import { logger } from '../helpers/logger'

interface HandleCompletedParams {
  payload: Payload
  task: any
  conversation: any
  phone: string
  summary?: string
}

export async function handleCompleted({
  payload,
  task,
  conversation,
  phone,
  summary,
}: HandleCompletedParams) {
  // Update Task
  await payload.update({
    collection: 'tasks',
    id: task.id,
    data: {
      status: TaskStatus.COMPLETED,
      completedAt: new Date().toISOString(),
    },
  })

  // Update Conversation
  await payload.update({
    collection: 'conversations',
    id: conversation.id,
    data: {
      aiIntent: 'completed',
      aiSummary: summary || 'Employee marked the task as completed.',
      isProcessedByAI: true,
    },
  })

  // Notify Employee
  await sendTextMessage({
    phone,
    text: `✅ *Task Completed*

Great work!

Your task *${task.taskNumber}* has been marked as completed.

👏 Thank you for the update.`,
  })

 logger.success(`Task ${task.taskNumber} completed`)
}

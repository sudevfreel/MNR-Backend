// // src/services/whatsapp/handlers/completed.ts

// import type { Payload } from 'payload'
// import { TaskStatus } from '@/core/enums/task-status'
// import { sendTextMessage } from '../send-text'
// import { logger } from '../helpers/logger'

// interface HandleCompletedParams {
//   payload: Payload
//   task: any
//   conversation: any
//   phone: string
//   summary?: string
// }

// export async function handleCompleted({
//   payload,
//   task,
//   conversation,
//   phone,
//   summary,
// }: HandleCompletedParams) {
//   // Update Task
//   await payload.update({
//     collection: 'tasks',
//     id: task.id,
//     data: {
//       status: TaskStatus.COMPLETED,
//       completedAt: new Date().toISOString(),
//     },
//   })

//   // Update Conversation
//   await payload.update({
//     collection: 'conversations',
//     id: conversation.id,
//     data: {
//       aiIntent: 'completed',
//       aiSummary: summary || 'Employee marked the task as completed.',
//       isProcessedByAI: true,
//     },
//   })

//   // Notify Employee
//   await sendTextMessage({
//     phone,
//     text: `✅ *Task Completed*

// Great work!

// Your task *${task.taskNumber}* has been marked as completed.

// 👏 Thank you for the update.`,
//   })

//  logger.success(`Task ${task.taskNumber} completed`)
// }

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
  try {
    // ============================================
    // 1. Update Task Status
    // ============================================

    console.log('========================================')
    console.log('🔍 TASK COMPLETION DEBUG')
    console.log('Task ID:', task.id)
    console.log('Task Number:', task.taskNumber)
    console.log('Current Status:', task.status)
    console.log('Target Status:', TaskStatus.COMPLETED)

    const updatedTask = await payload.update({
      collection: 'tasks',
      id: task.id,
      data: {
        status: TaskStatus.COMPLETED,
        completedAt: new Date().toISOString(),
      },
    })

    console.log('✅ TASK UPDATE RESULT')
    console.log('Updated Task ID:', updatedTask.id)
    console.log('Updated Task Number:', updatedTask.taskNumber)
    console.log('Updated Status:', updatedTask.status)
    console.log('Completed At:', updatedTask.completedAt)
    console.log('========================================')

    // ============================================
    // 2. Update Conversation
    // ============================================

    const updatedConversation = await payload.update({
      collection: 'conversations',
      id: conversation.id,
      data: {
        aiIntent: 'completed',
        aiSummary: summary || 'Employee marked the task as completed.',
        isProcessedByAI: true,
      },
    })

    console.log('✅ Conversation updated:', updatedConversation.id)

    // ============================================
    // 3. Notify Employee
    // ============================================

    await sendTextMessage({
      phone,
      text: `✅ *Task Completed*

Great work!

Your task *${task.taskNumber}* has been marked as completed.

👏 Thank you for the update.`,
    })

    // ============================================
    // 4. Success
    // ============================================

    logger.success(`Task ${task.taskNumber} completed`)
  } catch (error) {
    console.error('========================================')
    console.error('❌ TASK COMPLETION FAILED')
    console.error('Task ID:', task.id)
    console.error('Task Number:', task.taskNumber)
    console.error('Error:', error)
    console.error('========================================')

    logger.error(`Failed to complete task ${task.taskNumber}`, error)

    throw error
  }
}

// src/services/whatsapp/helpers/find-task.ts

import type { Payload } from 'payload'
import { TaskStatus } from '@/core/enums/task-status'

interface FindTaskParams {
  payload: Payload
  employeeId: string
  replyContextId?: string
}

export async function findTask({ payload, employeeId, replyContextId }: FindTaskParams) {
  // ----------------------------------------
  // 1. Try reply context
  // ----------------------------------------

  if (replyContextId) {
    console.log(`↩️ Looking up reply context: ${replyContextId}`)

    const { docs: conversations } = await payload.find({
      collection: 'conversations',
      depth: 2,
      where: {
        whatsappMessageId: {
          equals: replyContextId,
        },
      },
      limit: 1,
    })

    if (conversations.length) {
      const reminderConversation: any = conversations[0]

      if (reminderConversation.task) {
        console.log(`✅ Found task from reply context: ${reminderConversation.task.taskNumber}`)

        return reminderConversation.task
      }
    }

    console.warn('⚠️ Reply context not found')
  }

  // ----------------------------------------
  // 2. Fallback to latest active task
  // ----------------------------------------

  console.log('🔍 Falling back to latest active task')

  const { docs: tasks } = await payload.find({
    collection: 'tasks',
    depth: 1,
    sort: '-createdAt',
    limit: 1,
    where: {
      and: [
        {
          assignedTo: {
            equals: employeeId,
          },
        },
        {
          status: {
            in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
          },
        },
      ],
    },
  })

  if (!tasks.length) {
    console.warn('⚠️ No active task found')

    return null
  }

  console.log(`📋 Using latest task: ${tasks[0].taskNumber}`)

  return tasks[0]
}

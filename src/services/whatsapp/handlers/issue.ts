// src/services/whatsapp/handlers/issue.ts

import type { Payload } from 'payload'
import { TaskStatus } from '@/core/enums/task-status'
import { sendTextMessage } from '../send-text'
import { notifyManager } from '../notify-manager'
import { logger } from '../helpers/logger'

interface HandleIssueParams {
  payload: Payload
  task: any
  conversation: any
  employee: any
  manager?: any
  phone: string
  summary: string
}

export async function handleIssue({
  payload,
  task,
  conversation,
  employee,
  manager,
  phone,
  summary,
}: HandleIssueParams) {
  logger.info('========== HANDLE ISSUE ==========')
  logger.info(`Manager object: ${JSON.stringify(manager, null, 2)}`)

  // Update Task
  await payload.update({
    collection: 'tasks',
    id: task.id,
    data: {
      status: TaskStatus.ISSUE,
    },
  })

  // Update Conversation
  await payload.update({
    collection: 'conversations',
    id: conversation.id,
    data: {
      aiIntent: 'issue',
      aiSummary: summary,
      isProcessedByAI: true,
    },
  })

  // Notify Manager
  if (manager?.whatsappNumber || manager?.phone) {
    try {
      logger.manager(`Manager phone: ${manager.whatsappNumber || manager.phone}`)

      logger.info('Calling notifyManager...')

      await notifyManager({
        managerPhone: manager.whatsappNumber || manager.phone,
        employeeName: employee.name,
        taskNumber: task.taskNumber,
        taskTitle: task.title,
        status: 'Issue',
        summary,
      })

      logger.success('Manager notified successfully')
    } catch (error: any) {
      logger.error(error.response?.data || error.message)
    }
  } else {
    logger.warn('⚠️ No manager found or manager phone number missing')
  }

  // Notify Employee
  await sendTextMessage({
    phone,
    text: `⚠️ *Issue Recorded*

Thank you for letting us know.

Your manager has been notified and will review the issue shortly.

📝 *Reported Issue:*
${summary}`,
  })

  logger.success(`⚠️ Task ${task.taskNumber} marked as ISSUE`)
}

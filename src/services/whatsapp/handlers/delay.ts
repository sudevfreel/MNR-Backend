// src/services/whatsapp/handlers/delay.ts

import type { Payload } from 'payload'
import { sendTextMessage } from '../send-text'
import { notifyManager } from '../notify-manager'

interface HandleDelayParams {
  payload: Payload
  task: any
  conversation: any
  employee: any
  manager?: any
  phone: string
  summary: string
}

export async function handleDelay({
  payload,
  task,
  conversation,
  employee,
  manager,
  phone,
  summary,
}: HandleDelayParams) {
  // Schedule next reminder after 2 hours
  const nextReminder = new Date(Date.now() + 2 * 60 * 60 * 1000)

  // Update Task
  await payload.update({
    collection: 'tasks',
    id: task.id,
    data: {
      lastReminderAt: nextReminder.toISOString(),
    },
  })

  // Update Conversation
  await payload.update({
    collection: 'conversations',
    id: conversation.id,
    data: {
      aiIntent: 'delay',
      aiSummary: summary,
      isProcessedByAI: true,
    },
  })

  // Notify Manager
  if (manager?.whatsappNumber || manager?.phone) {
    try {
      console.log(`📤 Sending delay notification to manager: ${manager.name}`)

      await notifyManager({
        managerPhone: manager.whatsappNumber || manager.phone,
        employeeName: employee.name,
        taskNumber: task.taskNumber,
        taskTitle: task.title,
        status: 'Delayed',
        summary,
      })

      console.log('✅ Manager notified successfully')
    } catch (error: any) {
      console.error('❌ Failed to notify manager')
      console.error(error.response?.data || error.message)
    }
  } else {
    console.warn('⚠️ No manager found or manager phone number missing')
  }

  // Notify Employee
  await sendTextMessage({
    phone,
    text: `⏳ *Delay Recorded*

Thanks for the update.

Your manager has been informed.

📝 *Reason:*
${summary}

🔔 I'll remind you again in approximately 2 hours.`,
  })

  console.log(`⏳ Task ${task.taskNumber} delayed until ${nextReminder.toLocaleString('en-IN')}`)
}

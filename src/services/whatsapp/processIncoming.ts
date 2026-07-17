import type { Payload } from 'payload'

import { TaskStatus } from '@/core/enums/task-status'
import { sendTextMessage } from './send-text'

interface IncomingMessage {
  id: string
  from: string
  timestamp?: string
  type: string
  text?: {
    body: string
  }
  context?: {
    id: string
    from?: string
  }
}

export async function processIncomingMessage(payload: Payload, message: IncomingMessage) {
  const phone = message.from.replace(/^91/, '')
  const originalMessage = message.text?.body ?? ''
  const text = originalMessage.trim().toUpperCase()

  console.log('\n============== PROCESS MESSAGE ==============')
  console.log('📞 Phone:', phone)
  console.log('💬 Message:', originalMessage)
  console.log('🆔 WhatsApp Message ID:', message.id)

  if (message.context?.id) {
    console.log('↩️ Reply Context:', message.context.id)
  }

  /**
   * Prevent duplicate webhook processing
   */
  const { docs: existingConversation } = await payload.find({
    collection: 'conversations',
    where: {
      whatsappMessageId: {
        equals: message.id,
      },
    },
    limit: 1,
  })

  if (existingConversation.length) {
    console.log('⚠️ Duplicate message ignored')
    return
  }

  /**
   * Find employee
   */
  const { docs: users } = await payload.find({
    collection: 'users',
    where: {
      or: [
        {
          phone: {
            equals: phone,
          },
        },
        {
          whatsappNumber: {
            equals: phone,
          },
        },
      ],
    },
    limit: 1,
  })

  if (!users.length) {
    console.log('❌ Employee not found')

    await sendTextMessage({
      phone,
      text: 'Sorry, we could not identify your account.',
    })

    return
  }

  const employee: any = users[0]

  console.log('✅ Employee:', employee.name)

  /**
   * Find latest active task
   */
  const { docs: tasks } = await payload.find({
    collection: 'tasks',
    depth: 1,
    limit: 1,
    sort: '-createdAt',
    where: {
      and: [
        {
          assignedTo: {
            equals: employee.id,
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
    console.log('⚠️ No active task')

    await sendTextMessage({
      phone,
      text: 'You have no active task.',
    })

    return
  }

  const task: any = tasks[0]

  console.log('📋 Task:', task.taskNumber)

  /**
   * Save incoming conversation
   */
  const conversation: any = await payload.create({
    collection: 'conversations',
    data: {
      task: task.id,
      employee: employee.id,
      direction: 'incoming',
      messageType: 'text',
      message: originalMessage,
      whatsappMessageId: message.id,
      messageStatus: 'delivered',
      isProcessedByAI: false,
    },
  })

  console.log('💾 Incoming conversation saved')

  /**
   * DONE
   */
  if (text.includes('DONE') || text.includes('COMPLETED') || text.includes('FINISHED')) {
    await payload.update({
      collection: 'tasks',
      id: task.id,
      data: {
        status: TaskStatus.COMPLETED,
      },
    })

    await payload.update({
      collection: 'conversations',
      id: conversation.id,
      data: {
        aiIntent: 'completed',
        isProcessedByAI: true,
      },
    })

    await sendTextMessage({
      phone,
      text: `✅ Great job!\n\nTask ${task.taskNumber} has been marked as completed.`,
    })

    console.log('✅ Task Completed')

    return
  }

  /**
   * ISSUE
   */
  if (text.includes('ISSUE') || text.includes('PROBLEM')) {
    await payload.update({
      collection: 'tasks',
      id: task.id,
      data: {
        status: TaskStatus.IN_PROGRESS,
      },
    })

    await payload.update({
      collection: 'conversations',
      id: conversation.id,
      data: {
        aiIntent: 'issue',
        isProcessedByAI: true,
      },
    })

    await sendTextMessage({
      phone,
      text: '⚠️ Your issue has been reported.\n\nThe manager will contact you shortly.',
    })

    console.log('⚠️ Issue Reported')

    return
  }

  /**
   * SNOOZE
   */
  if (text.includes('SNOOZE') || text.includes('LATER')) {
    const nextReminder = new Date(Date.now() + 2 * 60 * 60 * 1000)

    await payload.update({
      collection: 'tasks',
      id: task.id,
      data: {
        lastReminderAt: nextReminder.toISOString(),
      },
    })

    await payload.update({
      collection: 'conversations',
      id: conversation.id,
      data: {
        aiIntent: 'in_progress',
        isProcessedByAI: true,
      },
    })

    await sendTextMessage({
      phone,
      text: '😴 Okay.\n\nI will remind you again after 2 hours.',
    })

    console.log('😴 Reminder Snoozed')

    return
  }

  /**
   * Unknown command
   */
  await payload.update({
    collection: 'conversations',
    id: conversation.id,
    data: {
      aiIntent: 'unknown',
      isProcessedByAI: true,
    },
  })

  await sendTextMessage({
    phone,
    text: `I didn't understand your reply.

Please reply with one of the following:

✅ DONE
⚠️ ISSUE
😴 SNOOZE`,
  })

  console.log('❓ Unknown command')
}

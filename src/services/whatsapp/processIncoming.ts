import type { Payload } from 'payload'

import { TaskStatus } from '@/core/enums/task-status'
import { sendTextMessage } from './send-text'
import { classifyReply } from '../ai/classify-reply'
import { notifyManager } from './notify-manager'

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
   * ---------------------------------------------------------
   * Prevent duplicate webhook processing
   * ---------------------------------------------------------
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
    console.log('⚠️ Duplicate webhook ignored')
    return
  }

  /**
   * ---------------------------------------------------------
   * Find Employee
   * ---------------------------------------------------------
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
   * ---------------------------------------------------------
   * Find Task
   * Priority:
   * 1. Reply Context
   * 2. Latest Active Task
   * ---------------------------------------------------------
   */

  let task: any = null

  if (message.context?.id) {
    console.log('🔍 Looking for original reminder...')

    const { docs: conversations } = await payload.find({
      collection: 'conversations',
      depth: 2,
      where: {
        whatsappMessageId: {
          equals: message.context.id,
        },
      },
      limit: 1,
    })

    if (conversations.length) {
      const reminderConversation: any = conversations[0]

      if (reminderConversation.task) {
        task = reminderConversation.task

        console.log(`✅ Reply belongs to task ${task.taskNumber}`)
      }
    } else {
      console.log('⚠️ Reminder conversation not found')
    }
  }

  /**
   * ---------------------------------------------------------
   * Fallback
   * ---------------------------------------------------------
   */

  if (!task) {
    console.log('🔍 Falling back to latest active task...')

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

    task = tasks[0]

    console.log(`⚠️ Using latest task ${task.taskNumber}`)
  }

  console.log('📋 Selected Task:', task.taskNumber)

  /**
   * ---------------------------------------------------------
   * Save Incoming Conversation
   * ---------------------------------------------------------
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
   * ---------------------------------------------------------
   * DONE
   * ---------------------------------------------------------
   */

  if (text.includes('DONE') || text.includes('COMPLETED') || text.includes('FINISHED')) {
    await payload.update({
      collection: 'tasks',
      id: task.id,
      data: {
        status: TaskStatus.COMPLETED,
        completedAt: new Date().toISOString(),
      },
    })

    await payload.update({
      collection: 'conversations',
      id: conversation.id,
      data: {
        aiIntent: 'completed',
        isProcessedByAI: true,
        aiSummary: 'Employee marked the task as completed.',
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
   * ---------------------------------------------------------
   * ISSUE
   * ---------------------------------------------------------
   */
  if (text.includes('ISSUE') || text.includes('PROBLEM') || text.includes('STUCK')) {
    await payload.update({
      collection: 'tasks',
      id: task.id,
      data: {
        status: TaskStatus.ISSUE,
      },
    })

    await payload.update({
      collection: 'conversations',
      id: conversation.id,
      data: {
        aiIntent: 'issue',
        isProcessedByAI: true,
        aiSummary: originalMessage,
      },
    })

    await sendTextMessage({
      phone,
      text: '⚠️ Thank you. Your issue has been reported to your manager. They will contact you shortly.',
    })

    console.log('⚠️ Issue Reported')

    return
  }

  /**
   * ---------------------------------------------------------
   * SNOOZE
   * ---------------------------------------------------------
   */
  if (text.includes('SNOOZE') || text.includes('LATER') || text.includes('AFTER')) {
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
        aiSummary: 'Employee requested a reminder later.',
      },
    })

    await sendTextMessage({
      phone,
      text: '😴 Sure! I will remind you again after 2 hours.',
    })

    console.log('😴 Reminder Snoozed')

    return
  }

  const { docs: groups } = await payload.find({
    collection: 'groups',
    depth: 2,
    where: {
      employees: {
        contains: employee.id,
      },
    },
    limit: 1,
  })

  const manager: any = groups[0]?.manager ?? null

  if (manager) {
    console.log(`👨‍💼 Manager: ${manager.name}`)
  } else {
    console.log('⚠️ No manager found for employee')
  }

  /**
   * ---------------------------------------------------------
   * Unknown Reply
   * ---------------------------------------------------------
   */

  console.log('🤖 Sending message to Gemini...')

  let ai

  try {
    console.log('🤖 Sending message to Gemini...')

    ai = await classifyReply(originalMessage)

    console.log('🤖 AI Result:', ai)
  } catch (error) {
    console.error('Gemini Error:', error)

    await payload.update({
      collection: 'conversations',
      id: conversation.id,
      data: {
        aiIntent: 'unknown',
        aiSummary: originalMessage,
        isProcessedByAI: false,
      },
    })

    await sendTextMessage({
      phone,
      text: "Sorry, I couldn't understand your message. Please try again.",
    })

    return
  }

  console.log('🤖 AI Result:', ai)

  switch (ai.intent) {
    case 'completed':
      await payload.update({
        collection: 'tasks',
        id: task.id,
        data: {
          status: TaskStatus.COMPLETED,
          completedAt: new Date().toISOString(),
        },
      })

      await payload.update({
        collection: 'conversations',
        id: conversation.id,
        data: {
          aiIntent: ai.intent,
          aiSummary: ai.summary,
          isProcessedByAI: true,
        },
      })

      await sendTextMessage({
        phone,
        text: `✅ Great job!\n\nTask ${task.taskNumber} has been marked as completed.`,
      })

      return

    case 'issue':
      await payload.update({
        collection: 'tasks',
        id: task.id,
        data: {
          status: TaskStatus.ISSUE,
        },
      })

      await payload.update({
        collection: 'conversations',
        id: conversation.id,
        data: {
          aiIntent: ai.intent,
          aiSummary: ai.summary,
          isProcessedByAI: true,
        },
      })

      console.log(
        '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        manager,
      )

      if (manager) {
        await notifyManager({
          managerPhone: manager.whatsappNumber || manager.phone,
          employeeName: employee.name,
          taskNumber: task.taskNumber,
          taskTitle: task.title,
          status: 'Issue',
          summary: ai.summary,
        })
      }

      await sendTextMessage({
        phone,
        text: '⚠️ Thank you. Your issue has been reported to your manager.',
      })

      return

    case 'delay':
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
          aiIntent: ai.intent,
          aiSummary: ai.summary,
          isProcessedByAI: true,
        },
      })

      // Notify Manager
      if (manager) {
        await notifyManager({
          managerPhone: manager.whatsappNumber || manager.phone,
          employeeName: employee.name,
          taskNumber: task.taskNumber,
          taskTitle: task.title,
          status: 'Delayed',
          summary: ai.summary,
        })
      }

      await sendTextMessage({
        phone,
        text: "😴 Sure! I'll remind you again in 2 hours.",
      })

      return

    case 'in_progress':
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
          aiIntent: ai.intent,
          aiSummary: ai.summary,
          isProcessedByAI: true,
        },
      })

      await sendTextMessage({
        phone,
        text: "👍 Got it. I'll keep tracking this task.",
      })

      return

    default:
      await payload.update({
        collection: 'conversations',
        id: conversation.id,
        data: {
          aiIntent: ai.intent,
          aiSummary: ai.summary,
          isProcessedByAI: true,
        },
      })

      await sendTextMessage({
        phone,
        text: `I couldn't confidently understand your reply.

Examples you can send:

✅ Done
🚧 Still working
⏳ Need one more hour
⚠️ Customer unavailable`,
      })

      return
  }
}

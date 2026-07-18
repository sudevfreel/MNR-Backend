import type { Payload } from 'payload'

import { classifyReply, type ClassificationResult } from '../ai/classify-reply'

import { sendTextMessage } from './send-text'

import { findEmployee } from './helpers/find-employee'
import { findTask } from './helpers/find-task'
import { findManager } from './helpers/find-manager'
import { saveConversation } from './helpers/save-conversation'

import { handleCompleted } from './handlers/completed'
import { handleIssue } from './handlers/issue'
import { handleDelay } from './handlers/delay'
import { handleInProgress } from './handlers/in-progress'
import { handleUnknown } from './handlers/unknown'

import { logger } from './helpers/logger'

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
  try {
    const phone = message.from.replace(/^91/, '')

    // Ignore unsupported message types
    if (message.type !== 'text') {
      logger.warn(`Unsupported message type: ${message.type}`)
      return
    }

    const originalMessage = message.text?.body?.trim()

    if (!originalMessage) {
      logger.warn('Empty message received')
      return
    }

    logger.incoming(phone, originalMessage)

    // --------------------------------------------------
    // Prevent duplicate webhook processing
    // --------------------------------------------------

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
      logger.warn('Duplicate webhook ignored')
      return
    }

    // --------------------------------------------------
    // Find Employee
    // --------------------------------------------------

    const employee = await findEmployee({
      payload,
      phone,
    })

    if (!employee) {
      logger.error('Employee not found')

      await sendTextMessage({
        phone,
        text: 'Sorry, we could not identify your account.',
      })

      return
    }

    logger.employee(employee.name)

    // --------------------------------------------------
    // Find Task
    // --------------------------------------------------

    const task = await findTask({
      payload,
      employeeId: employee.id,
      replyContextId: message.context?.id,
    })

    if (!task) {
      logger.warn('No active task found')

      await sendTextMessage({
        phone,
        text: 'You have no active task.',
      })

      return
    }

    logger.task(task.taskNumber)

    // --------------------------------------------------
    // Find Manager
    // --------------------------------------------------

    const manager = await findManager({
      payload,
      employeeId: employee.id,
    })

    if (manager) {
      logger.manager(manager.name)
    } else {
      logger.warn('No manager assigned')
    }

    // --------------------------------------------------
    // Save Incoming Conversation
    // --------------------------------------------------

    const conversation = await saveConversation({
      payload,
      taskId: task.id,
      employeeId: employee.id,
      message: originalMessage,
      whatsappMessageId: message.id,
    })

    // --------------------------------------------------
    // Gemini Classification
    // --------------------------------------------------

    let ai: ClassificationResult

    try {
      ai = await classifyReply(originalMessage)

      logger.ai(ai.intent, ai.summary)
    } catch (error) {
      logger.error('Gemini Error', error)

      await sendTextMessage({
        phone,
        text: "Sorry, I couldn't understand your message. Please try again.",
      })

      return
    }

    // --------------------------------------------------
    // Handle AI Intent
    // --------------------------------------------------

    switch (ai.intent) {
      case 'completed':
        await handleCompleted({
          payload,
          task,
          conversation,
          phone,
          summary: ai.summary,
        })
        break

      case 'issue':
        await handleIssue({
          payload,
          task,
          conversation,
          employee,
          manager,
          phone,
          summary: ai.summary,
        })
        break

      case 'delay':
        await handleDelay({
          payload,
          task,
          conversation,
          employee,
          manager,
          phone,
          summary: ai.summary,
        })
        break

      case 'in_progress':
        await handleInProgress({
          payload,
          task,
          conversation,
          phone,
          summary: ai.summary,
        })
        break

      case 'unknown':
      default:
        await handleUnknown({
          payload,
          conversation,
          phone,
          summary: ai.summary,
        })
        break
    }

    logger.success('Incoming message processed successfully')
  } catch (error) {
    logger.error('processIncomingMessage failed', error)
  }
}

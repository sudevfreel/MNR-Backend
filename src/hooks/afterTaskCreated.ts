import type { CollectionAfterChangeHook } from 'payload'

import { sendTaskMessage } from '@/services/whatsapp/send-message'

export const afterTaskCreated: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  // Only run when creating a task
  if (operation !== 'create') {
    return doc
  }

  try {
    // Fetch employee
    const employee = await req.payload.findByID({
      collection: 'users',
      id: doc.assignedTo,
    })

    if (!employee) {
      console.error('Employee not found')
      return doc
    }

    const whatsappNumber = employee.whatsappNumber || employee.phone

    if (!whatsappNumber) {
      console.error(`No WhatsApp number found for ${employee.name}`)
      return doc
    }

    // Send WhatsApp (currently mock)
    const response = await sendTaskMessage({
      phone: whatsappNumber,
      employeeName: employee.name,
      taskTitle: doc.title,
      description: doc.description,
      dueDate: doc.dueDate,
    })

    // Save outgoing conversation
    await req.payload.create({
      collection: 'conversations',
      data: {
        task: doc.id,
        employee: employee.id,

        direction: 'outgoing',

        messageType: 'text',

        message: response.message,

        whatsappMessageId: response.messageId,

        messageStatus: 'sent',

        isProcessedByAI: false,
      },
    })

    console.log(`✅ Task ${doc.taskNumber} sent to ${employee.name}`)
  } catch (error) {
    console.error('Error sending WhatsApp message')

    console.error(error)
  }

  return doc
}

import type { Payload } from 'payload'

interface WhatsAppStatus {
  id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
}

export async function updateMessageStatus(payload: Payload, status: WhatsAppStatus) {
  console.log('\n=========== UPDATE MESSAGE STATUS ===========')
  console.log('Message ID :', status.id)
  console.log('Status     :', status.status)

  const { docs } = await payload.find({
    collection: 'conversations',
    where: {
      whatsappMessageId: {
        equals: status.id,
      },
    },
    limit: 1,
  })

  if (!docs.length) {
    console.log('⚠️ Conversation not found')
    return
  }

  await payload.update({
    collection: 'conversations',
    id: docs[0].id,
    data: {
      messageStatus: status.status,
    },
  })

  console.log('✅ Conversation updated')
}

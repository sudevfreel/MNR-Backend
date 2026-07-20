import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

export interface SendTaskMessageParams {
  phone: string
  taskTitle: string
  description?: string
  employeeName: string
  dueDate?: string
}

export interface WhatsAppSendResponse {
  messaging_product: string
  contacts: {
    input: string
    wa_id: string
  }[]
  messages: {
    id: string
  }[]
  messageBody: string
}

export async function sendTaskMessage({
  phone,
  taskTitle,
  description,
  employeeName,
  dueDate,
}: SendTaskMessageParams): Promise<WhatsAppSendResponse> {
  console.log('📤 Sending WhatsApp Template')
  console.log({
    phone,
    employeeName,
    taskTitle,
    dueDate,
  })

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: `${phone}`,
        type: 'template',
        template: {
          name: 'task_reminder',
          language: {
            code: 'en',
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: employeeName,
                },
                {
                  type: 'text',
                  text: taskTitle,
                },
                {
                  type: 'text',
                  text: dueDate
                    ? new Date(dueDate).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'Not specified',
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('✅ WhatsApp Sent')
    console.log(response.data)

    return {
      ...response.data,
      messageBody: `Task Reminder sent to ${employeeName}`,
    }
  } catch (error: any) {
    console.error('❌ WhatsApp Error')
    console.error(error.response?.data || error.message)
    throw error
  }
}

// import axios from 'axios'

// export interface SendTaskMessageParams {
//   phone: string
//   taskTitle: string
//   description?: string
//   employeeName: string
//   dueDate?: string
// }

// export async function sendTaskMessage({
//   phone,
//   taskTitle,
//   description,
//   employeeName,
//   dueDate,
// }: SendTaskMessageParams) {
//   console.log(`📤 Sending WhatsApp message to ${employeeName} (${phone})`)

//   try {
//     const response = await axios.post(
//       `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
//       {
//         messaging_product: 'whatsapp',
//         to: `91${phone}`,
//         type: 'template',

//         // Use hello_world until task_assigned is approved
//         template: {
//           name: 'hello_world',
//           language: {
//             code: 'en_US',
//           },
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
//           'Content-Type': 'application/json',
//         },
//       },
//     )

//     console.log('✅ WhatsApp sent successfully')
//     console.log(response.data)

//     return {
//       success: true,
//       messageId: response.data.messages?.[0]?.id,
//       message: 'Hello World Template Sent',
//     }
//   } catch (error: any) {
//     console.error('❌ STATUS:', error.response?.status)
//     console.error('❌ META ERROR:', JSON.stringify(error.response?.data, null, 2))

//     throw error
//   }
// }

import axios from 'axios'

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
  const message = `🏗️ MNR Construction

Hello ${employeeName},

A new task has been assigned.

📌 ${taskTitle}

📝 ${description || '-'}

📅 Due:
${dueDate || 'Not specified'}

Reply:
DONE
ISSUE
DELAYED`

  // const response = await axios.post(
  //   `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
  //   {
  //     messaging_product: 'whatsapp',
  //     to: `91${phone}`,
  //     type: 'template',
  //     template: {
  //       name: 'task_assigned',
  //       language: {
  //         code: 'en_US',
  //       },
  //       components: [
  //         {
  //           type: 'body',
  //           parameters: [
  //             {
  //               type: 'text',
  //               text: employeeName,
  //             },
  //             {
  //               type: 'text',
  //               text: taskTitle,
  //             },
  //             {
  //               type: 'text',
  //               text: dueDate || 'Not specified',
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     headers: {
  //       Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  //       'Content-Type': 'application/json',
  //     },
  //   },
  // )

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: `91${phone}`,
        type: 'template',
        template: {
          name: 'hello_world',
          language: {
            code: 'en_US',
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    )

    return {
      ...response.data,
      messageBody: 'Hello World Template',
    }
  } catch (error: any) {
    console.error(error.response?.data)
    throw error
  }

  // return {
  //   ...response.data,
  //   messageBody: message,
  // }
}

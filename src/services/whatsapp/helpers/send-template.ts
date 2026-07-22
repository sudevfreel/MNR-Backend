import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

interface SendTemplateParams {
  phone: string
  template: string
  parameters: string[]
}

export async function sendTemplateMessage({ phone, template, parameters }: SendTemplateParams) {
  const cleanedPhone = phone.replace(/\D/g, '')
  const formattedPhone = cleanedPhone.startsWith('91') ? cleanedPhone : `91${cleanedPhone}`

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: template,
          language: {
            code: 'en',
          },
          components: [
            {
              type: 'body',
              parameters: parameters.map((text) => ({
                type: 'text',
                text,
              })),
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

    console.log('✅ Template sent')
    console.log(response.data)

    return response.data
  } catch (error: any) {
    console.error(error.response?.data || error)
    throw error
  }
}

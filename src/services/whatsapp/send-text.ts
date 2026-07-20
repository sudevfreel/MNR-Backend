import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

interface SendTextParams {
  phone: string
  text: string
}

export async function sendTextMessage({ phone, text }: SendTextParams) {
  try {
    const cleanedPhone = phone.replace(/\D/g, '')
    const formattedPhone = cleanedPhone.startsWith('91') ? cleanedPhone : `91${cleanedPhone}`

    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: text,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('\n✅ WhatsApp Text Sent Successfully')
    console.log(JSON.stringify(response.data, null, 2))
    console.log('\n===========================================\n')

    return response.data
  } catch (error: any) {
    console.error('\n❌ Failed to send WhatsApp text')

    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2))
    } else {
      console.error(error)
    }

    throw error
  }
}

import { whatsappConfig } from '@/config/whatsapp'
import axios from 'axios'

interface SendMessageParams {
  phone: string
  message: string
}

export class WhatsAppService {
  async sendTextMessage({ phone, message }: SendMessageParams) {
    try {
      const response = await axios.post(
        `${whatsappConfig.baseUrl}/v1/messages`,
        {
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: {
            body: message,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'D360-API-KEY': whatsappConfig.apiKey,
          },
        },
      )

      return response.data
    } catch (error: any) {
      console.error(error.response?.data || error.message)
      throw error
    }
  }
}

export default new WhatsAppService()

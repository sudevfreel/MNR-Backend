import whatsappService from '@/services/whatsapp/whatsapp.service'
import { Request, Response } from 'express'

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, message } = req.body

    const result = await whatsappService.sendTextMessage({
      phone,
      message,
    })

    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp message',
    })
  }
}

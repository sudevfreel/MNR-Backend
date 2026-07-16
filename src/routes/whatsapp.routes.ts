import { Router } from 'express'
import { sendMessage } from '../controllers/whatsapp.controller'

const router = Router()

router.post('/send', sendMessage)

export default router

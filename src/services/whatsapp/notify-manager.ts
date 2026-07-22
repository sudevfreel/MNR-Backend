import { logger } from './helpers/logger'
import { sendTemplateMessage } from './helpers/send-template'

interface NotifyManagerProps {
  managerPhone: string
  employeeName: string
  employeePhone: string
  taskNumber: string
  taskTitle: string
  status: string
  summary: string
}

export async function notifyManager({
  managerPhone,
  employeeName,
  employeePhone,
  taskNumber,
  summary,
}: NotifyManagerProps) {
  logger.whatsapp(`Manager phone received: ${managerPhone}`)

  await sendTemplateMessage({
    phone: managerPhone,
    template: 'manager_issue_notification',
    parameters: [employeeName, employeePhone, taskNumber, summary],
  })

  logger.success('Manager notification sent')
}

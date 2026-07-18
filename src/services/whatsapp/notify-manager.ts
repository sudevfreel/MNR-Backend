import { sendTextMessage } from './send-text'

interface NotifyManagerProps {
  managerPhone: string
  employeeName: string
  taskNumber: string
  taskTitle: string
  status: string
  summary: string
}

export async function notifyManager({
  managerPhone,
  employeeName,
  taskNumber,
  taskTitle,
  status,
  summary,
}: NotifyManagerProps) {
  await sendTextMessage({
    phone: managerPhone,
    text: `🚨 *Task Update*

👷 Employee: ${employeeName}

📋 Task: ${taskNumber}
${taskTitle}

📌 Status: ${status}

📝 ${summary}`,
  })
}

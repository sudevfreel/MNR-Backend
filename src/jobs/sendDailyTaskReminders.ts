import cron from 'node-cron'
import type { Payload } from 'payload'

import { TaskStatus } from '@/core/enums/task-status'
import { sendTaskMessage } from '@/services/whatsapp/send-message'

import dotenv from 'dotenv'

dotenv.config()

function getToday7AM() {
  const date = new Date()
  date.setHours(7, 0, 0, 0)
  return date
}

export function startTaskReminderJob(payload: Payload) {
  const schedule = (process.env.CRON_SCHEDULE || '* * * * *').trim()
  const ignore7AM = process.env.IGNORE_7AM_CHECK === 'true'
  const testReminderMinutes = Number(process.env.TEST_REMINDER_INTERVAL_MINUTES || 0)

  if (!cron.validate(schedule)) {
    console.error('❌ Invalid CRON expression:', schedule)
    return
  }

  cron.schedule(
    schedule,
    async () => {
      try {
        const { docs: tasks } = await payload.find({
          collection: 'tasks',
          depth: 1,
          limit: 1000,
          where: {
            and: [
              {
                isActive: {
                  equals: true,
                },
              },
              {
                status: {
                  in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
                },
              },
            ],
          },
        })

        const now = new Date()

        if (!ignore7AM) {
          const today7AM = getToday7AM()

          if (now < today7AM) {
            return
          }
        }

        for (const task of tasks) {
          try {
            let shouldSend = false

            if (!task.lastReminderAt) {
              shouldSend = true
            } else {
              const lastReminder = new Date(task.lastReminderAt)
              const nextReminder = new Date(lastReminder)

              if (testReminderMinutes > 0) {
                nextReminder.setMinutes(nextReminder.getMinutes() + testReminderMinutes)
              } else {
                nextReminder.setHours(nextReminder.getHours() + (task.reminderInterval || 2))
              }

              shouldSend = now >= nextReminder
            }

            if (!shouldSend) {
              continue
            }

            let employee: any

            if (typeof task.assignedTo === 'string') {
              employee = await payload.findByID({
                collection: 'users',
                id: task.assignedTo,
              })
            } else {
              employee = task.assignedTo
            }

            if (!employee) {
              console.log('❌ Employee not found')
              continue
            }

            if (!employee.isActive) {
              console.log('❌ Employee inactive')
              continue
            }

            const phone = employee.whatsappNumber || employee.phone

            if (!phone) {
              console.log('❌ No phone number')
              continue
            }

            const response = await sendTaskMessage({
              phone,
              employeeName: employee.name,
              taskTitle: task.title,
              description: task.description || '',
              dueDate: task.dueDate,
            })

            await payload.update({
              collection: 'tasks',
              id: task.id,
              data: {
                lastReminderAt: new Date().toISOString(),
              },
            })

            await payload.create({
              collection: 'conversations',
              data: {
                task: task.id,
                employee: employee.id,
                direction: 'outgoing',
                messageType: 'text',
                message: response.messageBody,
                whatsappMessageId: response.messages?.[0]?.id || '',
                messageStatus: 'sent',
                isProcessedByAI: false,
              },
            })
          } catch (err: any) {
            console.error(`❌ Failed sending reminder for ${task.taskNumber}`)

            if (err.response) {
              console.error('Meta Error:')
              console.error(JSON.stringify(err.response.data, null, 2))
            } else {
              console.error(err)
            }
          }
        }
      } catch (err) {
        console.error('❌ Reminder Job Failed')
        console.error(err)
      }
    },
    {
      timezone: 'Asia/Kolkata',
    },
  )
}

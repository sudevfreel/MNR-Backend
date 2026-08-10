// import cron from 'node-cron'
// import type { Payload } from 'payload'

// import { TaskStatus } from '@/core/enums/task-status'
// import { sendTaskMessage } from '@/services/whatsapp/send-message'

// import dotenv from 'dotenv'

// dotenv.config()

// function getToday7AM() {
//   const date = new Date()
//   date.setHours(7, 0, 0, 0)
//   return date
// }

// export function startTaskReminderJob(payload: Payload) {
//   const schedule = (process.env.CRON_SCHEDULE || '* * * * *').trim()
//   const ignore7AM = process.env.IGNORE_7AM_CHECK === 'true'
//   const testReminderMinutes = Number(process.env.TEST_REMINDER_INTERVAL_MINUTES || 0)

//   if (!cron.validate(schedule)) {
//     console.error('❌ Invalid CRON expression:', schedule)
//     return
//   }

//   cron.schedule(
//     schedule,
//     async () => {
//       try {
//         const { docs: tasks } = await payload.find({
//           collection: 'tasks',
//           depth: 1,
//           limit: 1000,
//           where: {
//             and: [
//               {
//                 isActive: {
//                   equals: true,
//                 },
//               },
//               {
//                 status: {
//                   in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
//                 },
//               },
//             ],
//           },
//         })

//         const now = new Date()

//         if (!ignore7AM) {
//           const today7AM = getToday7AM()

//           if (now < today7AM) {
//             return
//           }
//         }

//         for (const task of tasks) {
//           try {
//             let shouldSend = false

//             // =====================================================
//             // 1. Check task due date
//             // =====================================================

//             const dueDate = new Date(task.dueDate)

//             const todayIST = new Intl.DateTimeFormat('en-CA', {
//               timeZone: 'Asia/Kolkata',
//             }).format(now)

//             const taskDueDateIST = new Intl.DateTimeFormat('en-CA', {
//               timeZone: 'Asia/Kolkata',
//             }).format(dueDate)

//             // Task is scheduled for a future date.
//             // Do NOT send any reminder yet.
//             if (taskDueDateIST > todayIST) {
//               continue
//             }

//             // =====================================================
//             // 2. Decide whether reminder should be sent
//             // =====================================================

//             if (!task.lastReminderAt) {
//               // First reminder

//               const today7AM = getToday7AM()

//               // If task is due today, first reminder starts at 7 AM.
//               shouldSend = now >= today7AM
//             } else {
//               // ===================================================
//               // 3. Subsequent reminders
//               // ===================================================

//               const lastReminder = new Date(task.lastReminderAt)

//               const nextReminder = new Date(lastReminder)

//               if (testReminderMinutes > 0) {
//                 nextReminder.setMinutes(nextReminder.getMinutes() + testReminderMinutes)
//               } else {
//                 nextReminder.setHours(nextReminder.getHours() + (task.reminderInterval || 2))
//               }

//               shouldSend = now >= nextReminder
//             }

//             // =====================================================
//             // 4. Nothing to send
//             // =====================================================

//             if (!shouldSend) {
//               continue
//             }

//             // =====================================================
//             // 5. Get employee
//             // =====================================================

//             let employee: any

//             if (typeof task.assignedTo === 'string') {
//               employee = await payload.findByID({
//                 collection: 'users',
//                 id: task.assignedTo,
//               })
//             } else {
//               employee = task.assignedTo
//             }

//             if (!employee) {
//               console.log('❌ Employee not found')
//               continue
//             }

//             if (!employee.isActive) {
//               console.log('❌ Employee inactive')
//               continue
//             }

//             // =====================================================
//             // 6. Get phone number
//             // =====================================================

//             const phone = employee.whatsappNumber || employee.phone

//             if (!phone) {
//               console.log('❌ No phone number')
//               continue
//             }

//             // =====================================================
//             // 7. Send WhatsApp reminder
//             // =====================================================

//             const response = await sendTaskMessage({
//               phone,
//               employeeName: employee.name,
//               taskTitle: task.title,
//               description: task.description || '',
//               dueDate: task.dueDate,
//             })

//             // =====================================================
//             // 8. Update last reminder time
//             // =====================================================

//             await payload.update({
//               collection: 'tasks',
//               id: task.id,
//               data: {
//                 lastReminderAt: now.toISOString(),
//               },
//             })

//             // =====================================================
//             // 9. Save WhatsApp conversation
//             // =====================================================

//             await payload.create({
//               collection: 'conversations',
//               data: {
//                 task: task.id,
//                 employee: employee.id,
//                 direction: 'outgoing',
//                 messageType: 'text',
//                 message: response.messageBody,
//                 whatsappMessageId: response.messages?.[0]?.id || '',
//                 messageStatus: 'sent',
//                 isProcessedByAI: false,
//               },
//             })

//             console.log(`✅ Reminder sent for ${task.taskNumber} to ${employee.name}`)
//           } catch (err: any) {
//             console.error(`❌ Failed sending reminder for ${task.taskNumber}`)

//             if (err.response) {
//               console.error('Meta Error:')
//               console.error(JSON.stringify(err.response.data, null, 2))
//             } else {
//               console.error(err)
//             }
//           }
//         }
//       } catch (err) {
//         console.error('❌ Reminder Job Failed')
//         console.error(err)
//       }
//     },
//     {
//       timezone: 'Asia/Kolkata',
//     },
//   )
// }

import cron from 'node-cron'
import type { Payload } from 'payload'
import dotenv from 'dotenv'

import { TaskStatus } from '@/core/enums/task-status'
import { sendTaskMessage } from '@/services/whatsapp/send-message'

dotenv.config()

const TIMEZONE = 'Asia/Kolkata'

function getTodayIST() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
  }).format(new Date())
}

function getToday7AMIST() {
  const now = new Date()

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)

  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  const day = Number(parts.find((p) => p.type === 'day')?.value)

  // IST is UTC+05:30
  return new Date(Date.UTC(year, month - 1, day, 1, 30, 0, 0))
}

export function startTaskReminderJob(payload: Payload) {
  const schedule = (process.env.CRON_SCHEDULE || '0 * * * *').trim()

  const ignore7AM = process.env.IGNORE_7AM_CHECK === 'true'

  const testReminderMinutes = Number(process.env.TEST_REMINDER_INTERVAL_MINUTES || 0)

  if (!cron.validate(schedule)) {
    console.error('❌ Invalid CRON expression:', schedule)
    return
  }

  console.log('========================================')
  console.log('🚀 Task Reminder Job Started')
  console.log(`⏰ Schedule: ${schedule}`)
  console.log(`🌏 Timezone: ${TIMEZONE}`)
  console.log(`⏱️ Test interval: ${testReminderMinutes || 'Disabled'}`)
  console.log(`7 AM check ignored: ${ignore7AM}`)
  console.log('========================================')

  cron.schedule(
    schedule,
    async () => {
      try {
        const now = new Date()

        console.log('\n========================================')
        console.log('⏰ Running Task Reminder Job')
        console.log('Current time:', now.toISOString())
        console.log('IST date:', getTodayIST())
        console.log('========================================')

        // ============================================
        // 1. Don't process before 7 AM IST
        // ============================================

        if (!ignore7AM) {
          const today7AM = getToday7AMIST()

          if (now < today7AM) {
            console.log('⏳ Before 7 AM IST. Skipping reminder job.')
            return
          }
        }

        // ============================================
        // 2. Get active pending/in-progress tasks
        // ============================================

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

        console.log(`📋 Active tasks found: ${tasks.length}`)

        // ============================================
        // 3. Process each task
        // ============================================

        for (const task of tasks) {
          try {
            let shouldSend = false

            // ==========================================
            // 3A. Check task due date
            // ==========================================

            const dueDate = new Date(task.dueDate)

            const todayIST = new Intl.DateTimeFormat('en-CA', {
              timeZone: TIMEZONE,
            }).format(now)

            const taskDueDateIST = new Intl.DateTimeFormat('en-CA', {
              timeZone: TIMEZONE,
            }).format(dueDate)

            // Future task → don't send yet
            if (taskDueDateIST > todayIST) {
              console.log(`⏭️ ${task.taskNumber} is due on ${taskDueDateIST}. Skipping.`)

              continue
            }

            // ==========================================
            // 3B. First reminder
            // ==========================================

            if (!task.lastReminderAt) {
              const today7AM = getToday7AMIST()

              shouldSend = now >= today7AM

              console.log(`${task.taskNumber}: First reminder check → ${shouldSend}`)
            }

            // ==========================================
            // 3C. Subsequent reminders
            // ==========================================
            else {
              const lastReminder = new Date(task.lastReminderAt)

              const nextReminder = new Date(lastReminder)

              if (testReminderMinutes > 0) {
                nextReminder.setMinutes(nextReminder.getMinutes() + testReminderMinutes)
              } else {
                nextReminder.setHours(nextReminder.getHours() + (task.reminderInterval || 2))
              }

              shouldSend = now >= nextReminder

              console.log(
                `${task.taskNumber}: Next reminder ${nextReminder.toISOString()} → ${shouldSend}`,
              )
            }

            // ==========================================
            // 4. Nothing to send
            // ==========================================

            if (!shouldSend) {
              continue
            }

            // ==========================================
            // 5. Get employee
            // ==========================================

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
              console.log(`❌ Employee not found for ${task.taskNumber}`)
              continue
            }

            if (!employee.isActive) {
              console.log(`❌ Employee inactive: ${employee.name}`)
              continue
            }

            // ==========================================
            // 6. Employee phone
            // ==========================================

            const phone = employee.whatsappNumber || employee.phone

            if (!phone) {
              console.log(`❌ No phone number for ${employee.name}`)
              continue
            }

            // ==========================================
            // 7. Send WhatsApp reminder
            // ==========================================

            console.log(`📤 Sending reminder for ${task.taskNumber} → ${employee.name}`)

            const response = await sendTaskMessage({
              phone,
              employeeName: employee.name,
              taskTitle: task.title,
              description: task.description || '',
              dueDate: task.dueDate,
            })

            // ==========================================
            // 8. Update last reminder
            // ==========================================

            await payload.update({
              collection: 'tasks',
              id: task.id,
              data: {
                lastReminderAt: now.toISOString(),
              },
            })

            // ==========================================
            // 9. Save conversation
            // ==========================================

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

            console.log(`✅ Reminder sent for ${task.taskNumber} to ${employee.name}`)
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
      timezone: TIMEZONE,
    },
  )
}

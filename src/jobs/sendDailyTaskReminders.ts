// import cron from 'node-cron'
// import payload from 'payload'

// import { TaskStatus } from '@/core/enums/task-status'
// import { sendTaskMessage } from '@/services/whatsapp/send-message'

// function getToday7AM() {
//   const date = new Date()

//   date.setHours(7, 0, 0, 0)

//   return date
// }

// export function startTaskReminderJob() {
//   /**
//    * Runs every hour.
//    * Logic decides whether reminder should be sent.
//    */
//   cron.schedule(
//     '0 * * * *',
//     async () => {
//       console.log('🔔 Running Task Reminder Job...')

//       try {
//         const { docs: tasks } = await payload.find({
//           collection: 'tasks',
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
//                   not_equals: TaskStatus.COMPLETED,
//                 },
//               },
//             ],
//           },
//         })

//         console.log(`Found ${tasks.length} active tasks`)

//         const now = new Date()
//         const today7AM = getToday7AM()

//         for (const task of tasks) {
//           try {
//             /**
//              * Wait until today's 7 AM
//              */
//             if (now < today7AM) {
//               continue
//             }

//             const intervalHours = task.reminderInterval || 2

//             let shouldSend = false

//             /**
//              * Never reminded before.
//              * Send today's first reminder.
//              */
//             if (!task.lastReminderAt) {
//               shouldSend = true
//             } else {
//               const lastReminder = new Date(task.lastReminderAt)

//               const nextReminder = new Date(lastReminder)

//               nextReminder.setHours(nextReminder.getHours() + intervalHours)

//               if (now >= nextReminder) {
//                 shouldSend = true
//               }
//             }

//             if (!shouldSend) {
//               continue
//             }

//             const employee = await payload.findByID({
//               collection: 'users',
//               id: task.assignedTo as string,
//             })

//             if (!employee) {
//               console.log(`Employee not found for task ${task.taskNumber}`)
//               continue
//             }

//             const phone = employee.whatsappNumber || employee.phone

//             if (!phone) {
//               console.log(`No phone number found for ${employee.name}`)
//               continue
//             }

//             console.log(`Sending reminder for ${task.taskNumber} -> ${employee.name}`)

//             const response = await sendTaskMessage({
//               phone,
//               employeeName: employee.name,
//               taskTitle: task.title,
//               description: task.description || '',
//               dueDate: task.dueDate,
//             })

//             await payload.update({
//               collection: 'tasks',
//               id: task.id,
//               data: {
//                 lastReminderAt: new Date().toISOString(),
//               },
//             })

//             await payload.create({
//               collection: 'conversations',
//               data: {
//                 task: task.id,
//                 employee: employee.id,

//                 direction: 'outgoing',
//                 messageType: 'text',

//                 message: `Reminder sent for task ${task.taskNumber}`,

//                 whatsappMessageId: response.messages[0].id,

//                 messageStatus: 'sent',
//                 isProcessedByAI: false,
//               },
//             })

//             console.log(`✅ Reminder sent for ${task.taskNumber}`)
//           } catch (err) {
//             console.error(`❌ Failed reminder for ${task.taskNumber}`)

//             console.error(err)
//           }
//         }
//       } catch (err) {
//         console.error('Cron Job Failed')

//         console.error(err)
//       }
//     },
//     {
//       timezone: 'Asia/Kolkata',
//     },
//   )

//   console.log('✅ Task Reminder Job Started')
// }
import cron from 'node-cron'
import type { Payload } from 'payload'

import { TaskStatus } from '@/core/enums/task-status'
import { sendTaskMessage } from '@/services/whatsapp/send-message'

function getToday7AM() {
  const date = new Date()
  date.setHours(7, 0, 0, 0)
  return date
}

export function startTaskReminderJob(payload: Payload) {
  const schedule = process.env.CRON_SCHEDULE || '0 * * * *'
  const ignore7AM = process.env.IGNORE_7AM_CHECK === 'true'
  const testReminderMinutes = Number(process.env.TEST_REMINDER_INTERVAL_MINUTES || 0)

  cron.schedule(
    schedule,
    async () => {
      console.log(
        `\n🔔 Reminder Job Started : ${new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
        })}`,
      )

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

        console.log(`📋 Found ${tasks.length} active task(s)`)

        const now = new Date()

        if (!ignore7AM) {
          const today7AM = getToday7AM()

          if (now < today7AM) {
            console.log('⏳ Waiting for 7:00 AM...')
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
              console.log(`⏭️ Skipping ${task.taskNumber} (Reminder not due yet)`)
              continue
            }

            /**
             * assignedTo may already be populated
             */
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
              console.log(`❌ Employee not found (${task.taskNumber})`)
              continue
            }

            if (!employee.isActive) {
              console.log(`⏭️ Employee inactive (${employee.name})`)
              continue
            }

            const phone = employee.whatsappNumber || employee.phone

            if (!phone) {
              console.log(`❌ No phone number for ${employee.name}`)
              continue
            }

            console.log(`📨 Sending reminder for ${task.taskNumber} -> ${employee.name}`)

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

            console.log(`✅ Reminder sent successfully for ${task.taskNumber}`)
          } catch (err) {
            console.error(`❌ Failed sending reminder for ${task.taskNumber}`)
            console.error(err)
          }
        }

        console.log('🎉 Reminder Job Finished\n')
      } catch (err) {
        console.error('❌ Reminder Job Failed')
        console.error(err)
      }
    },
    {
      timezone: 'Asia/Kolkata',
    },
  )

  console.log('✅ Reminder Cron Started')
  console.log(`🕒 Schedule : ${schedule}`)
  console.log(`🚀 Ignore 7AM : ${ignore7AM}`)
  console.log(`⏱️ Test Interval : ${testReminderMinutes} minute(s)`)
}

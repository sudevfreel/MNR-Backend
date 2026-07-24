import config from '@payload-config'
import { getPayload } from 'payload'

import { TaskStatus } from '@/core/enums/task-status'

export async function getWeeklyProgress() {
  const payload = await getPayload({ config })

  const result = []

  for (let i = 6; i >= 0; i--) {
    const day = new Date()
    day.setDate(day.getDate() - i)

    const start = new Date(day)
    start.setHours(0, 0, 0, 0)

    const end = new Date(day)
    end.setHours(23, 59, 59, 999)

    const { docs } = await payload.find({
      collection: 'tasks',
      limit: 1000,
      where: {
        dueDate: {
          greater_than_equal: start.toISOString(),
          less_than_equal: end.toISOString(),
        },
      },
    })

    result.push({
      day: day.toLocaleDateString('en-US', {
        weekday: 'short',
      }),
      assigned: docs.length,
      completed: docs.filter((task) => task.status === TaskStatus.COMPLETED).length,
    })
  }

  return result
}

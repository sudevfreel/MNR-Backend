import config from '@payload-config'
import { getPayload } from 'payload'

import { TaskStatus } from '@/core/enums/task-status'
import { getRelationshipId } from '@/app/utils/getRelationshipId'
import { generateDailySummary } from './ai-summary.service'

export async function getDailyDashboard(date: Date) {
  const payload = await getPayload({ config })

  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const { docs: tasks } = await payload.find({
    collection: 'tasks',
    depth: 2,
    limit: 1000,
    where: {
      dueDate: {
        greater_than_equal: start.toISOString(),
        less_than_equal: end.toISOString(),
      },
    },
  })

  // Summary
  const assigned = tasks.length

  const completed = tasks.filter((task) => task.status === TaskStatus.COMPLETED).length

  const inProgress = tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length

  const issues = tasks.filter((task) => task.status === TaskStatus.ISSUE).length

  const percentage = assigned === 0 ? 0 : Math.round((completed / assigned) * 100)

  // Workforce
  const workforce = {
    working: new Set(
      tasks
        .filter((task) => task.status === TaskStatus.IN_PROGRESS)
        .map((task) => getRelationshipId(task.assignedTo))
        .filter(Boolean),
    ).size,

    completed: new Set(
      tasks
        .filter((task) => task.status === TaskStatus.COMPLETED)
        .map((task) => getRelationshipId(task.assignedTo))
        .filter(Boolean),
    ).size,

    issues: new Set(
      tasks
        .filter((task) => task.status === TaskStatus.ISSUE)
        .map((task) => getRelationshipId(task.assignedTo))
        .filter(Boolean),
    ).size,

    noResponse: 0,
  }

  const attention = tasks
    .filter((task) => task.status === TaskStatus.ISSUE || task.status === TaskStatus.PENDING)
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      taskNumber: task.taskNumber || 'NA',
      title: task.title,
      priority: task.priority,
      status: task.status ?? TaskStatus.PENDING,
      assignedTo:
        typeof task.assignedTo === 'object'
          ? (task.assignedTo?.name ?? 'Unknown Employee')
          : 'Unknown Employee',
    }))

  const timeline = tasks
    .map((task) => {
      const eventTime = task.completedAt ?? task.updatedAt ?? task.createdAt

      return {
        id: task.id,
        time: eventTime,
        taskNumber: task.taskNumber ?? 'N/A',
        title: task.title,
        status: task.status ?? TaskStatus.PENDING,
      }
    })
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10)

  const aiSummary = await generateDailySummary({
    assigned,
    completed,
    inProgress,
    issues,
  })

  return {
    date,

    summary: {
      assigned,
      completed,
      inProgress,
      issues,
    },

    progress: {
      total: assigned,
      completed,
      percentage,
    },

    workforce,

    attention,

    timeline,

    aiSummary,

    tasks,
  }
}

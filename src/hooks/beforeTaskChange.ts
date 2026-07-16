import type { CollectionBeforeChangeHook } from 'payload'

import { TaskStatus } from '@/core/enums/task-status'

export const beforeTaskChange: CollectionBeforeChangeHook = async ({ req, data, operation }) => {
  // User must be logged in
  if (!req.user) {
    return data
  }

  // Create Operation
  if (operation === 'create') {
    // Generate Task Number
    const totalTasks = await req.payload.count({
      collection: 'tasks',
    })

    data.taskNumber = `MNR-${String(totalTasks.totalDocs + 1).padStart(6, '0')}`

    // Save creator
    data.createdBy = req.user.id

    // Default Status
    data.status = TaskStatus.PENDING
  }

  // Every update
  data.updatedBy = req.user.id

  return data
}

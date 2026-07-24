import config from '@payload-config'
import { getPayload } from 'payload'

import { TaskStatus } from '@/core/enums/task-status'

export async function getGroupProgress() {
  const payload = await getPayload({ config })

  const { docs: tasks } = await payload.find({
    collection: 'tasks',
    depth: 2,
    limit: 1000,
  })

  const groups = new Map<
    string,
    {
      id: string
      name: string
      site: string
      manager: string
      assigned: number
      completed: number
    }
  >()

  for (const task of tasks) {
    if (typeof task.assignedGroup !== 'object' || !task.assignedGroup) {
      continue
    }

    const group = task.assignedGroup

    const id = String(group.id)

    if (!groups.has(id)) {
      groups.set(id, {
        id,
        name: group.name,
        site: group.siteCode,
        manager: typeof group.manager === 'object' ? group.manager.name : 'Unknown',
        assigned: 0,
        completed: 0,
      })
    }

    const item = groups.get(id)!

    item.assigned++

    if (task.status === TaskStatus.COMPLETED) {
      item.completed++
    }
  }

  return [...groups.values()].map((group) => ({
    ...group,
    percentage: group.assigned === 0 ? 0 : Math.round((group.completed / group.assigned) * 100),
  }))
}

// src/services/whatsapp/helpers/find-manager.ts

import type { Payload } from 'payload'

interface FindManagerParams {
  payload: Payload
  employeeId: string
}

export async function findManager({ payload, employeeId }: FindManagerParams) {
  const { docs: groups } = await payload.find({
    collection: 'groups',
    depth: 2,
    where: {
      employees: {
        contains: employeeId,
      },
    },
    limit: 1,
  })

  if (!groups.length) {
    console.warn('⚠️ Employee is not assigned to any group')
    return null
  }

  const group: any = groups[0]

  if (!group.manager) {
    console.warn(`⚠️ No manager assigned for group "${group.name}"`)
    return null
  }

  console.log(`👨‍💼 Manager: ${group.manager.name}`)

  return group.manager
}

import type { Payload } from 'payload'

interface FindManagerParams {
  payload: Payload
  groupId: string
}

export async function findManager({ payload, groupId }: FindManagerParams) {
  const group: any = await payload.findByID({
    collection: 'groups',
    id: groupId,
    depth: 2,
  })

  if (!group.manager) {
    console.warn(`⚠️ No manager assigned for group "${group.name}"`)
    return null
  }

  console.log(`👨‍💼 Manager: ${group.manager.name}`)

  return group.manager
}

// interface FindManagerParams {
//   payload: Payload
//   employeeId: string
// }

// export async function findManager({ payload, employeeId }: FindManagerParams) {
//   const { docs: groups } = await payload.find({
//     collection: 'groups',
//     depth: 2,
//     where: {
//       employees: {
//         contains: employeeId,
//       },
//     },
//     limit: 1,
//   })

//   console.log('Employee ID:', employeeId)
//   console.log('Groups found:', groups.length)
//   console.log(groups)

//   if (!groups.length) {
//     console.warn('⚠️ Employee is not assigned to any group')
//     return null
//   }

//   const group: any = groups[0]

//   if (!group.manager) {
//     console.warn(`⚠️ No manager assigned for group "${group.name}"`)
//     return null
//   }

//   console.log(`👨‍💼 Manager: ${group.manager.name}`)

//   return group.manager
// }

// src/services/whatsapp/helpers/find-employee.ts

import type { Payload } from 'payload'

interface FindEmployeeParams {
  payload: Payload
  phone: string
}

export async function findEmployee({ payload, phone }: FindEmployeeParams) {
  const cleanPhone = phone.replace(/^91/, '')

  const { docs } = await payload.find({
    collection: 'users',
    where: {
      or: [
        {
          phone: {
            equals: cleanPhone,
          },
        },
        {
          whatsappNumber: {
            equals: cleanPhone,
          },
        },
      ],
    },
    limit: 1,
  })

  if (!docs.length) {
    return null
  }

  return docs[0]
}

import { isAdmin } from '@/access/admin'
import { isManager } from '@/access/manager'
import type { CollectionConfig } from 'payload'

export const Groups: CollectionConfig = {
  slug: 'groups',

  access: {
    create: isManager,
    update: isManager,
    delete: isAdmin,
    read: ({ req }) => !!req.user,
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'siteCode', 'manager', 'isActive'],
    group: 'Task Management',
  },

  fields: [
    {
      name: 'name',
      label: 'Group Name',
      type: 'text',
      required: true,
      unique: true,
    },

    {
      name: 'siteCode',
      label: 'Site Code',
      type: 'text',
      required: true,
      unique: true,
    },

    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
    },

    {
      name: 'whatsappGroupId',
      label: 'WhatsApp Group ID',
      type: 'text',
      validate: (value: string | null | undefined) => {
        if (!value) return true

        // Example: 120363412345678901@g.us
        if (!value.endsWith('@g.us')) {
          return 'Please enter a valid WhatsApp Group ID'
        }

        return true
      },
    },

    {
      name: 'manager',
      label: 'Group Manager',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      filterOptions: {
        role: {
          equals: 'manager',
        },
      },
    },

    {
      name: 'employees',
      label: 'Employees',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      required: true,
      filterOptions: {
        role: {
          equals: 'employee',
        },
      },
    },

    {
      name: 'notes',
      label: 'Internal Notes',
      type: 'textarea',
    },

    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],

  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.siteCode) {
          data.siteCode = data.siteCode.toUpperCase().trim()
        }

        return data
      },
    ],
  },

  timestamps: true,
}

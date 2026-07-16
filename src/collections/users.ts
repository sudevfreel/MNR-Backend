import { isAdmin } from '@/access/admin'
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',

  auth: true,

  access: {
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
    read: ({ req }) => !!req.user,
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'designation', 'role', 'isActive'],
    group: 'User Management',
  },

  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.isWhatsappSame) {
          data.whatsappNumber = data.phone
        }

        return data
      },
    ],
  },

  fields: [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
    },

    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      required: true,
      unique: true,
      validate: (value: string | null | undefined) => {
        if (!value) return 'Phone Number is required'

        const phone = value.replace(/\s+/g, '')

        if (!/^[6-9]\d{9}$/.test(phone)) {
          return 'Enter a valid 10-digit Indian mobile number'
        }

        return true
      },
    },

    {
      name: 'isWhatsappSame',
      label: 'WhatsApp Number is same as Phone Number',
      type: 'checkbox',
      defaultValue: true,
    },

    {
      name: 'whatsappNumber',
      label: 'WhatsApp Number',
      type: 'text',
      admin: {
        condition: (_, siblingData) => !siblingData?.isWhatsappSame,
      },
      validate: (value: string | null | undefined, { siblingData }: any) => {
        if (!siblingData?.isWhatsappSame && !value) {
          return 'WhatsApp Number is required'
        }

        if (value) {
          const phone = value.replace(/\s+/g, '')

          if (!/^[6-9]\d{9}$/.test(phone)) {
            return 'Enter a valid 10-digit Indian mobile number'
          }
        }

        return true
      },
    },

    {
      name: 'designation',
      label: 'Designation',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Supervisor',
          value: 'supervisor',
        },
        {
          label: 'Site Engineer',
          value: 'site-engineer',
        },
        {
          label: 'Mason',
          value: 'mason',
        },
        {
          label: 'Electrician',
          value: 'electrician',
        },
        {
          label: 'Painter',
          value: 'painter',
        },
        {
          label: 'Plumber',
          value: 'plumber',
        },
        {
          label: 'Helper',
          value: 'helper',
        },
        {
          label: 'Carpenter',
          value: 'carpenter',
        },
        {
          label: 'Welder',
          value: 'welder',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
    },

    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      defaultValue: 'employee',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Manager',
          value: 'manager',
        },
        {
          label: 'Employee',
          value: 'employee',
        },
      ],
      admin: {
        position: 'sidebar',
      },
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

    {
      name: 'lastLogin',
      label: 'Last Login',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },

    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
    },
  ],

  timestamps: true,
}

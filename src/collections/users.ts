import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',

  auth: true,

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'isActive'],
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
      validate: (value: string | null | undefined) => {
        if (!value) return 'Phone Number is required'

        const phone = value.replace(/\s+/g, '')

        if (!/^[6-9]\d{9}$/.test(phone)) {
          return 'Enter a valid 10-digit mobile number'
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

        return true
      },
    },

    {
      name: 'designation',
      label: 'Designation',
      type: 'text',
      required: true,
    },

    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      defaultValue: 'manager',
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
    },

    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox',
      defaultValue: true,
    },

    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
    },

    {
      name: 'lastLogin',
      label: 'Last Login',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],

  timestamps: true,
}

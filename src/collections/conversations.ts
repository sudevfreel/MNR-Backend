import type { CollectionConfig } from 'payload'

export const Conversations: CollectionConfig = {
  slug: 'conversations',

  admin: {
    useAsTitle: 'whatsappMessageId',
    defaultColumns: ['task', 'employee', 'direction', 'messageStatus', 'createdAt'],
    group: 'Task Management',
  },

  fields: [
    {
      name: 'task',
      label: 'Task',
      type: 'relationship',
      relationTo: 'tasks',
      required: true,
    },

    {
      name: 'employee',
      label: 'Employee',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },

    {
      name: 'direction',
      label: 'Direction',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Outgoing',
          value: 'outgoing',
        },
        {
          label: 'Incoming',
          value: 'incoming',
        },
      ],
    },

    {
      name: 'messageType',
      label: 'Message Type',
      type: 'select',
      required: true,
      defaultValue: 'text',
      options: [
        {
          label: 'Text',
          value: 'text',
        },
        {
          label: 'Image',
          value: 'image',
        },
        {
          label: 'Document',
          value: 'document',
        },
        {
          label: 'Video',
          value: 'video',
        },
        {
          label: 'Audio',
          value: 'audio',
        },
      ],
    },

    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
    },

    {
      name: 'messageStatus',
      label: 'Message Status',
      type: 'select',
      defaultValue: 'sent',
      options: [
        {
          label: 'Sent',
          value: 'sent',
        },
        {
          label: 'Delivered',
          value: 'delivered',
        },
        {
          label: 'Read',
          value: 'read',
        },
        {
          label: 'Failed',
          value: 'failed',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    {
      name: 'whatsappMessageId',
      label: 'WhatsApp Message ID',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },

    {
      name: 'aiIntent',
      label: 'AI Intent',
      type: 'select',
      options: [
        {
          label: 'Completed',
          value: 'completed',
        },
        {
          label: 'In Progress',
          value: 'in_progress',
        },
        {
          label: 'Issue',
          value: 'issue',
        },
        {
          label: 'Material Request',
          value: 'material_request',
        },
        {
          label: 'Delay',
          value: 'delay',
        },
        {
          label: 'Unknown',
          value: 'unknown',
        },
      ],
      admin: {
        readOnly: true,
      },
    },

    {
      name: 'aiSummary',
      label: 'AI Summary',
      type: 'textarea',
      admin: {
        readOnly: true,
      },
    },

    {
      name: 'isProcessedByAI',
      label: 'Processed By AI',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],

  timestamps: true,
}

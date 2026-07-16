import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/admin'
import { isManager } from '@/access/manager'
import { Priority } from '@/core/enums/priority'
import { TaskStatus } from '@/core/enums/task-status'
// import { afterTaskCreated } from '@/hooks/afterTaskCreated'
import { beforeTaskChange } from '@/hooks/beforeTaskChange'


export const Tasks: CollectionConfig = {
  slug: 'tasks',

  access: {
    create: isManager,
    update: isManager,
    delete: isAdmin,
    read: ({ req }) => !!req.user,
  },

  admin: {
    useAsTitle: 'taskNumber',
    defaultColumns: ['taskNumber', 'title', 'assignedTo', 'priority', 'status', 'dueDate'],
    group: 'Task Management',
  },

  hooks: {
    beforeChange: [beforeTaskChange],
    // afterChange: [afterTaskCreated],
  },

  fields: [
    {
      name: 'taskNumber',
      label: 'Task Number',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
      },
    },

    {
      name: 'title',
      label: 'Task Title',
      type: 'text',
      required: true,
    },

    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
    },

    {
      name: 'assignedGroup',
      label: 'Assigned Group',
      type: 'relationship',
      relationTo: 'groups',
      required: true,
    },

    {
      name: 'assignedTo',
      label: 'Assigned Employee',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },

    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      required: true,
      defaultValue: Priority.MEDIUM,
      options: [
        {
          label: 'Low',
          value: Priority.LOW,
        },
        {
          label: 'Medium',
          value: Priority.MEDIUM,
        },
        {
          label: 'High',
          value: Priority.HIGH,
        },
        {
          label: 'Critical',
          value: Priority.CRITICAL,
        },
      ],
    },

    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: TaskStatus.PENDING,
      admin: {
        condition: (_, __, { operation }) => operation === 'update',
      },
      options: [
        {
          label: 'Pending',
          value: TaskStatus.PENDING,
        },
        {
          label: 'In Progress',
          value: TaskStatus.IN_PROGRESS,
        },
        {
          label: 'Completed',
          value: TaskStatus.COMPLETED,
        },
        {
          label: 'Issue',
          value: TaskStatus.ISSUE,
        },
        {
          label: 'Cancelled',
          value: TaskStatus.CANCELLED,
        },
      ],
    },

    {
      name: 'dueDate',
      label: 'Due Date',
      type: 'date',
      required: true,
    },

    {
      name: 'reminderInterval',
      label: 'Reminder Interval (Hours)',
      type: 'number',
      defaultValue: 2,
      min: 1,
    },

    {
      name: 'lastReminderAt',
      label: 'Last Reminder',
      type: 'date',
      admin: {
        hidden: true,
      },
    },

    {
      name: 'completedAt',
      label: 'Completed At',
      type: 'date',
      admin: {
        hidden: true,
      },
    },

    {
      name: 'remarks',
      label: 'Remarks',
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

    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        hidden: true,
      },
    },

    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        hidden: true,
      },
    },
  ],

  timestamps: true,
}

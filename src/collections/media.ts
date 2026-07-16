import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',

  access: {
    read: () => true,
  },

  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
  },

  admin: {
    useAsTitle: 'filename',
  },

  fields: [
    {
      name: 'alt',
      label: 'Alt Text',
      type: 'text',
    },
  ],
}

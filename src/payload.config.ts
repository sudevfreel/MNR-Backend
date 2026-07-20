import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { Users } from './collections/users'
import { Media } from './collections/media'
import { Groups } from './collections/groups'
import { Tasks } from './collections/tasks'
import { Conversations } from './collections/conversations'
import { startTaskReminderJob } from './jobs/sendDailyTaskReminders'
import dotenv from 'dotenv'

dotenv.config()

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// startTaskReminderJob()

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  onInit: async (payload) => {
    console.log('✅ Payload Initialized')

    startTaskReminderJob(payload)
  },
  collections: [Users, Media, Groups, Tasks, Conversations],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
})

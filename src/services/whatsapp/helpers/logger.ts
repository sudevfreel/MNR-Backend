// src/services/whatsapp/helpers/logger.ts

const ENABLE_LOGS = process.env.NODE_ENV !== 'production'

function log(prefix: string, ...args: unknown[]) {
  if (!ENABLE_LOGS) return
  console.log(prefix, ...args)
}

function error(prefix: string, ...args: unknown[]) {
  console.error(prefix, ...args)
}

export const logger = {
  info: (...args: unknown[]) => log('ℹ️', ...args),

  success: (...args: unknown[]) => log('✅', ...args),

  warn: (...args: unknown[]) => log('⚠️', ...args),

  error: (...args: unknown[]) => error('❌', ...args),

  incoming: (phone: string, message: string) => log('📩 Incoming', `${phone}: "${message}"`),

  employee: (name: string) => log('👤 Employee', name),

  manager: (name: string) => log('👨‍💼 Manager', name),

  task: (taskNumber: string) => log('📋 Task', taskNumber),

  ai: (intent: string, summary?: string) =>
    log('🤖 AI', {
      intent,
      summary,
    }),

  whatsapp: (...args: unknown[]) => log('💬 WhatsApp', ...args),
}

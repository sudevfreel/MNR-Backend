import 'dotenv/config'
import config from '@payload-config'
import { getPayload } from 'payload'
import { findManager } from '@/services/whatsapp/helpers/find-manager'

async function main() {
  const payload = await getPayload({ config })

  const manager = await findManager({
    payload,
    groupId: '6a564511f651a5ec1810f852',
  })

  console.log('\n====================')
  console.log(manager)
  console.log('====================\n')

  process.exit(0)
}

main().catch(console.error)

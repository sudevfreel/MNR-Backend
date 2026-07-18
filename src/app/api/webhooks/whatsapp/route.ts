import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'
import { processIncomingMessage } from '@/services/whatsapp/processIncoming'
import { updateMessageStatus } from '@/services/whatsapp/updateMessageStatus'

/**
 * GET
 * Webhook Verification
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    return new NextResponse(challenge, {
      status: 200,
    })
  }

  return NextResponse.json(
    {
      error: 'Verification failed',
    },
    {
      status: 403,
    },
  )
}

/**
 * POST
 * Incoming WhatsApp Webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const payload = await getPayload({
      config,
    })

    const value = body?.entry?.[0]?.changes?.[0]?.value

    /**
     * Incoming Messages
     */
    if (value?.messages?.length) {
      for (const msg of value.messages) {
        if (msg.type === 'text') {
          if (msg.type === 'text') {
            await processIncomingMessage(payload, msg)
          }
        }
      }
    }

    /**
     * Message Status Updates
     */
    if (value?.statuses?.length) {
      for (const status of value.statuses) {
        await updateMessageStatus(payload, {
          id: status.id,
          status: status.status,
        })

        if (status.errors) {
          console.log('❌ Errors')
          console.log(JSON.stringify(status.errors, null, 2))
        }
      }
    }

    return NextResponse.json({
      success: true,
    })
  } catch (err) {
    console.error(err)

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    )
  }
}
